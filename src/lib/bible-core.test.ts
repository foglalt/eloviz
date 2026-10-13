import assert from "node:assert/strict";
import test from "node:test";
import { BIBLE_BOOKS, bibleBookBySlug, bibleChapterNeighbours, bibleVerseHref, parseBibleChapter, parseBibleLookup } from "./bible-core.ts";

test("all 66 book slugs are Hungarian, unique and canonical",()=>{
  assert.equal(BIBLE_BOOKS.length,66);
  assert.equal(new Set(BIBLE_BOOKS.map((book)=>book.slug)).size,66);
  assert.equal(bibleBookBySlug("janos")?.code,"John");
  assert.equal(bibleVerseHref("John.3.16"),"/biblia/karoli-1908/janos/3#vers-16");
  assert.equal(bibleVerseHref("Ps.119.176"),"/biblia/karoli-1908/zsoltarok/119#vers-176");
  assert.equal(bibleVerseHref("Fake.1.1"),null);
});
test("strict chapter URLs reject padding, decimals and malicious values",()=>{
  assert.equal(parseBibleChapter("150"),150);
  for(const value of ["0","01","1.5","-2","1/2","%31"]) assert.equal(parseBibleChapter(value),null);
});
test("lookup understands Hungarian aliases and cross-chapter ranges",()=>{
  assert.equal(parseBibleLookup("János 3:16")?.osisStart,"John.3.16");
  assert.equal(parseBibleLookup("1Móz 1:31–2:3")?.osisEnd,"Gen.2.3");
  assert.equal(parseBibleLookup("ismeretlen 1:1"),null);
});
test("chapter navigation crosses book boundaries and stops at canon ends",()=>{
  const counts=new Map(BIBLE_BOOKS.map((book,index)=>[book.slug,index===0 ? 50 : index===65 ? 22 : 1]));
  assert.deepEqual(bibleChapterNeighbours("1mozes",50,counts).next,{slug:"2mozes",chapter:1});
  assert.deepEqual(bibleChapterNeighbours("2mozes",1,counts).previous,{slug:"1mozes",chapter:50});
  assert.equal(bibleChapterNeighbours("1mozes",1,counts).previous,null);
  assert.equal(bibleChapterNeighbours("jelenesek",22,counts).next,null);
  assert.deepEqual(bibleChapterNeighbours("janos",99,counts),{previous:null,next:null});
});
