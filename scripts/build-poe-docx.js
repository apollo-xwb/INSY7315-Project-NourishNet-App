const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = require('docx');

function splitIntoSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = { title: null, paras: [] };
  for (const line of lines) {
    if (/^\d+\.\s/.test(line) || /^Cover Page/i.test(line) || /^Table of Contents/i.test(line) || /^Harvard References/i.test(line)) {
      if (current.title || current.paras.length) sections.push(current);
      current = { title: line.trim(), paras: [] };
    } else {
      current.paras.push(line);
    }
  }
  if (current.title || current.paras.length) sections.push(current);
  return sections;
}

function paragraphFromText(text) {
  if (!text) return new Paragraph('');
  return new Paragraph({ children: [new TextRun({ text, font: 'Calibri', size: 22 })] });
}

(async () => {
  const inputPath = path.resolve('MASTER_POE.txt');
  if (!fs.existsSync(inputPath)) {
    console.error('MASTER_POE.txt not found.');
    process.exit(1);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  const logical = splitIntoSections(raw);

  const sections = [];

  // Title section
  sections.push({
    children: [
      new Paragraph({ text: 'Portfolio of Evidence – NourishNet (MealsOnWheels)', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: 'Replace placeholders and embed diagrams/screenshots before submission.', alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new PageBreak()] })
    ]
  });

  // Content sections
  for (const [idx, sec] of logical.entries()) {
    const children = [];
    if (sec.title) {
      children.push(new Paragraph({ text: sec.title, heading: HeadingLevel.HEADING_1 }));
    }
    const body = sec.paras.join('\n').trim();
    if (body.length) {
      const paras = body.split(/\n\s*\n/);
      for (const p of paras) {
        const lines = p.split(/\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) continue;
        children.push(paragraphFromText(lines.join(' ')));
      }
    }
    if (idx < logical.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    sections.push({ children });
  }

  const doc = new Document({
    sections,
    styles: {
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true }, paragraph: { spacing: { after: 120 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true }, paragraph: { spacing: { before: 120, after: 80 } } },
        { id: 'Normal', name: 'Normal', run: { size: 22 }, paragraph: { spacing: { line: 276 } } }
      ]
    }
  });

  const outPath = path.resolve('POE_Master.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log('DOCX created at', outPath);
})();
