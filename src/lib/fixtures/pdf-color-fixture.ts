// Small real PDF covering painting state and color changes inside one text run.
export function createColorFixturePdf() {
  const content = `BT /F1 12 Tf 72 740 Td
0 g (Normal ) Tj 1 0 0 rg (piros) Tj 0 g ( normal.) Tj
0 -30 Td 0.6 0 0 rg (Bordo szoveg.) Tj
0 -30 Td 0 g (Normal ) Tj 1 0 0 rg (kiemeles) Tj 0 g ( ismet normal.) Tj
0 -30 Td 0 1 1 0 k (CMYK piros.) Tj
0 -30 Td 0 g 1 0 0 RG 1 Tr (Piros kontur.) Tj 0 Tr
0 -30 Td 1 0.5 0 rg (Narancs.) Tj
0 -30 Td 1 0 1 rg (Magenta.) Tj
0 -30 Td 0.5 g (Szurke.) Tj
0 -30 Td 0 g (Olvasd: ) Tj 1 0 0 rg [(J\\341nos ) -30 (3:16)] TJ 0 g ( verset.) Tj
0 -30 Td 0 g (- Lista ) Tj 1 0 0 rg (piros) Tj 0 g ( resze.) Tj
0 -30 Td 0 g (- Masodik lista.) Tj
0 -30 Td 1 0 0 rg (elva-) Tj 0 g
0 -15 Td 1 0 0 rg (lasztas) Tj 0 g ( megmarad.) Tj
ET`;
  return createTextFixturePdf(content, ["Helvetica"]);
}

export function createBoldFixturePdf() {
  return createTextFixturePdf(`BT /F1 12 Tf 72 740 Td
(Normal ) Tj /F2 12 Tf (bold) Tj /F1 12 Tf ( normal.) Tj
0 -30 Td /F3 12 Tf (Italic stays normal.) Tj
0 -30 Td /F4 12 Tf (Bold italic.) Tj
0 -30 Td /F5 12 Tf (Different family stays normal.) Tj
0 -30 Td /F1 12 Tf (Red ) Tj 1 0 0 rg (red) Tj /F2 12 Tf ( and bold) Tj 0 g /F1 12 Tf ( normal.) Tj
0 -30 Td (- List ) Tj /F2 12 Tf (bold) Tj /F1 12 Tf ( part.) Tj
0 -30 Td (- Second item.) Tj
0 -30 Td (Read: ) Tj /F2 12 Tf (J\\341nos 3:16) Tj /F1 12 Tf ( today.) Tj
0 -30 Td /F2 12 Tf (wrap-) Tj
0 -15 Td (ped) Tj /F1 12 Tf ( remains.) Tj
ET`, ["Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Times-BoldItalic", "Courier"]);
}

export function createSpoilerFixturePdf() {
  return createTextFixturePdf(`BT /F1 12 Tf 72 740 Td
0 g (Lathato ) Tj 1 0 0 rg (titkos valasz) Tj 0 g ( marad.) Tj
0 -30 Td (Csak alahuzott.) Tj
0 -30 Td 1 0 0 rg (Csak piros.) Tj
0 -30 Td 0 g (Keresd: ) Tj 1 0 0 rg (J\\341nos 3:16) Tj 0 g ( verset.) Tj
0 -30 Td (- Elso ) Tj 1 0 0 rg (titok) Tj 0 g ( resz.) Tj
0 -30 Td (- Masodik pont.) Tj
0 -30 Td 1 0 0 rg (R\\351szleges titok szoveg.) Tj
0 -30 Td (Nem athuzas.) Tj
ET
0 G 0.5 w 129.6 738 m 223.2 738 l S
72 708 m 180 708 l S
129.6 648 m 201.6 648 l S
122.4 618 m 158.4 618 l S
144 558 m 180 558 l S
72 534 m 158.4 534 l S
`, ["Courier"]);
}

function createTextFixturePdf(content: string, fonts: string[]) {
  const streamId = 4 + fonts.length;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << ${fonts.map((_, index) => `/F${index + 1} ${index + 4} 0 R`).join(" ")} >> >> /Contents ${streamId} 0 R >>`,
    ...fonts.map((font) => `<< /Type /Font /Subtype /Type1 /BaseFont /${font} /Encoding /WinAnsiEncoding >>`),
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const startXref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  return Buffer.from(pdf);
}
