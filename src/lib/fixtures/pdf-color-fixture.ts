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
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
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
