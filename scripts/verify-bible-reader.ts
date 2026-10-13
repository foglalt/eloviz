import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const base = process.env.BIBLE_VERIFICATION_BASE_URL ?? "http://localhost:3010";
if (!process.env.DATABASE_URL || !process.env.BIBLE_VERIFICATION_BRANCH_HOST) throw new Error("An explicitly selected isolated branch is required.");
const host = new URL(process.env.DATABASE_URL).hostname;
assert.equal(host, process.env.BIBLE_VERIFICATION_BRANCH_HOST);
assert.notEqual(host.replace("-pooler.", "."), "ep-quiet-art-ag937ry6.c-2.eu-central-1.aws.neon.tech");
const sql=neon(process.env.DATABASE_URL);
const ids=Array.from({length:5},()=>randomUUID());
const docs=Array.from({length:6},()=>randomUUID());
const prefix=`bible-probe-${randomUUID()}`;
const slugs=ids.map((_,index)=>`${prefix}-${index}`);
const studyLabels=["Ellenőrzés: átfedő versek","Ellenőrzés: fejezethatár","Ellenőrzés: régi PDF","Ellenőrzés: piszkozat","Ellenőrzés: PDF nélkül"];

async function page(path:string) { const response=await fetch(`${base}${path}`); assert.equal(response.status,200,path); return response.text(); }
function verseBlock(html:string,number:number) {
  const start=html.indexOf(`id="vers-${number}"`);
  assert.ok(start>=0,`Verse ${number} must be rendered.`);
  const tail=html.slice(start);
  const end=tail.slice(1).search(/id="vers-\d+"/);
  return end>=0 ? tail.slice(0,end+1) : tail.slice(0,tail.indexOf("</ol>"));
}
function present(html:string,number:number,index:number) { return verseBlock(html,number).includes(`/tanulmanyok/${slugs[index]}`); }
async function reference(studyIndex:number,docIndex:number,startChapter:number,startVerse:number,endChapter:number,endVerse:number) {
  await sql.query(`INSERT INTO study_scripture_references(study_id,document_id,display_label,book_code,start_chapter,start_verse,end_chapter,end_verse,osis_start,osis_end)
    VALUES($1,$2,'Ellenőrzött tartomány','John',$3,$4,$5,$6,$7,$8)`,[ids[studyIndex],docs[docIndex],startChapter,startVerse,endChapter,endVerse,`John.${startChapter}.${startVerse}`,`John.${endChapter}.${endVerse}`]);
}

try {
  await sql.transaction((transaction)=>[
    ...ids.map((id,index)=>transaction.query("INSERT INTO studies(id,slug,title,summary,status) VALUES($1,$2,$3,'Elkülönített ellenőrzési adat',$4)",[id,slugs[index],studyLabels[index],index===3 ? "draft":"published"])),
    ...docs.map((id,index)=>transaction.query(`INSERT INTO study_documents(id,study_id,version_number,original_filename,byte_size,sha256,storage_kind,storage_key,extraction_status)
      VALUES($1,$2,$3,'ellenorzes.pdf',1,$4,'static','/ellenorzes.pdf','complete')`,[id,ids[index<5 ? index:2],index===5 ? 2:1,id])),
    ...ids.slice(0,4).map((id,index)=>transaction.query("UPDATE studies SET published_document_id=$2 WHERE id=$1",[id,index===2 ? docs[5]:docs[index]])),
  ]);
  await reference(0,0,3,16,3,18);
  await reference(0,0,3,17,3,20);
  await reference(1,1,3,35,4,2);
  await reference(2,2,3,16,3,16); // obsolete document
  await reference(2,5,4,10,4,10); // current document
  await reference(3,3,3,16,3,16); // draft
  await reference(4,4,3,16,3,16); // no published document
  const html3=await page("/biblia/karoli-1908/janos/3");
  const html4=await page("/biblia/karoli-1908/janos/4");
  assert.equal(present(html3,15,0),false);
  assert.equal(present(html3,16,0),true);
  assert.equal(present(html3,20,0),true);
  assert.equal(present(html3,21,0),false);
  assert.equal(verseBlock(html3,17).split(`/tanulmanyok/${slugs[0]}`).length-1,1);
  assert.equal(present(html3,34,1),false);
  assert.equal(present(html3,35,1),true);
  assert.equal(present(html3,36,1),true);
  assert.equal(present(html4,1,1),true);
  assert.equal(present(html4,2,1),true);
  assert.equal(present(html4,3,1),false);
  for (const index of [2,3,4]) assert.equal(html3.includes(`/tanulmanyok/${slugs[index]}`),false);
  assert.equal(present(html4,10,2),true);
  const study=await page(`/tanulmanyok/${slugs[0]}`);
  assert.ok(study.includes('/biblia/karoli-1908/janos/3#vers-16'));
  await sql.query("UPDATE studies SET status='draft' WHERE id=$1",[ids[0]]);
  assert.equal((await page("/biblia/karoli-1908/janos/3")).includes(`/tanulmanyok/${slugs[0]}`),false);
  console.log("Inclusive, overlapping and cross-chapter ranges; deduplication; draft, missing-PDF and obsolete-revision exclusions; reverse links and immediate unpublication passed through real rendered routes.");
  for (const path of ["/biblia/karoli-1908/ismeretlen/1","/biblia/karoli-1908/janos/22","/biblia/karoli-1908/janos/01"]) assert.equal((await fetch(`${base}${path}`)).status,404,path);
  for(const [query,destination] of [["q=Jn+3%3A16","/biblia/karoli-1908/janos/3#vers-16"],["q=Jn+99%3A1","/biblia?hiba=1"],["konyv=zsoltarok&fejezet=119","/biblia/karoli-1908/zsoltarok/119"],["q=1M%C3%B3z+1%3A31-2%3A3","/biblia/karoli-1908/1mozes/1#vers-31"]]) {
    const response=await fetch(`${base}/biblia/megnyitas?${query}`,{redirect:"manual"});
    assert.equal(response.status,303);
    assert.equal(response.headers.get("location"),`${base}${destination}`);
  }
  const sitemap=await page("/sitemap.xml");
  assert.equal((sitemap.match(/\/biblia\/karoli-1908\/[^/]+\/\d+<\/loc>/g)??[]).length,1189);
  assert.ok(html3.includes('href="https://www.eloviz.hu/biblia/karoli-1908/janos/3"'));
  assert.ok(html3.includes("BreadcrumbList"));
  console.log("Invalid routes, reference and chapter redirects, chapter sitemap count, canonical metadata and breadcrumbs passed.");
} finally {
  await sql.query("DELETE FROM studies WHERE id=ANY($1::uuid[])",[ids]);
  assert.equal((await sql.query("SELECT 1 FROM studies WHERE id=ANY($1::uuid[])",[ids])).length,0);
  console.log("All isolated reader fixtures removed.");
}
