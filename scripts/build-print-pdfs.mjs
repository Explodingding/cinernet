/**
 * Build print-ready PDFs from the engineering markdown docs.
 *
 * Pipeline: markdown → styled HTML (marked) → PDF (Edge headless print engine).
 * Output: docs/print/<name>.pdf
 *
 * Usage:  node scripts/build-print-pdfs.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'docs', 'print');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const DOCS = [
  {
    md: 'docs/TPM_ALIGNMENT.md',
    out: 'CINERNET-TPM-Alignment',
    title: 'TPM Alignment',
    subtitle: 'Total Productive Maintenance · Engineering Alignment Document',
  },
  {
    md: 'docs/SCALABILITY_ROADMAP.md',
    out: 'CINERNET-Scalability-Roadmap',
    title: 'Scalability Roadmap',
    subtitle: 'Production Architecture & Future Phases · Technical Blueprint',
  },
];

const DATE = new Date().toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric',
});

const css = /* css */ `
  @page {
    size: A4;
    margin: 12mm 14mm 16mm 14mm;
  }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: 'Segoe UI', 'Inter', -apple-system, sans-serif;
    font-size: 9.5pt;
    line-height: 1.55;
    color: #1a2332;
    margin: 0;
  }

  /* ── Cover banner ─────────────────────────────────────────────── */
  .cover {
    background: linear-gradient(135deg, #0a0f1a 0%, #16243a 70%, #1b3a4d 100%);
    color: #e2e8f0;
    border-radius: 6px;
    padding: 28px 32px 24px;
    margin-bottom: 28px;
    page-break-inside: avoid;
  }
  .cover .brand {
    font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
    font-size: 8pt;
    letter-spacing: 4px;
    color: #34d399;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .cover h1 {
    font-size: 23pt;
    font-weight: 650;
    margin: 0 0 6px;
    color: #ffffff;
    letter-spacing: 0.3px;
  }
  .cover .subtitle {
    font-size: 10.5pt;
    color: #94a3b8;
    margin-bottom: 14px;
  }
  .cover .meta {
    display: flex;
    gap: 24px;
    font-family: Consolas, monospace;
    font-size: 7.5pt;
    color: #64748b;
    border-top: 1px solid rgba(148, 163, 184, 0.25);
    padding-top: 10px;
  }
  .cover .meta b { color: #cbd5e1; font-weight: 600; }

  /* ── Headings ─────────────────────────────────────────────────── */
  h1, h2, h3, h4 { page-break-after: avoid; line-height: 1.25; }
  .content > h1 { display: none; }   /* replaced by cover banner */
  h2 {
    font-size: 14pt;
    font-weight: 650;
    color: #0f2440;
    margin: 26px 0 10px;
    padding-bottom: 5px;
    border-bottom: 2.5px solid #34d399;
  }
  h3 {
    font-size: 11.5pt;
    font-weight: 650;
    color: #16243a;
    margin: 18px 0 8px;
  }
  h4 {
    font-size: 10pt;
    font-weight: 650;
    color: #1b3a4d;
    margin: 14px 0 6px;
  }

  p { margin: 6px 0 9px; }
  strong { color: #0f2440; }
  a { color: #0e7490; text-decoration: none; }
  hr { border: none; border-top: 1px solid #d8dee7; margin: 18px 0; }
  ul, ol { margin: 6px 0 10px; padding-left: 22px; }
  li { margin: 3px 0; }

  blockquote {
    margin: 10px 0;
    padding: 8px 16px;
    border-left: 3.5px solid #34d399;
    background: #f2faf7;
    color: #2d4a42;
    font-style: italic;
    page-break-inside: avoid;
  }
  blockquote p { margin: 2px 0; }

  /* ── Code ─────────────────────────────────────────────────────── */
  code {
    font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
    font-size: 8pt;
    background: #eef1f6;
    border: 1px solid #dde3ec;
    border-radius: 3px;
    padding: 0.5px 4px;
    color: #16243a;
  }
  pre {
    background: #f5f7fa;
    border: 1px solid #dde3ec;
    border-left: 3.5px solid #16243a;
    border-radius: 4px;
    padding: 10px 14px;
    overflow-x: hidden;
    page-break-inside: avoid;
    margin: 10px 0 12px;
  }
  pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 7.6pt;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* ── Tables ───────────────────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px;
    font-size: 8.6pt;
    page-break-inside: avoid;
  }
  th {
    background: #16243a;
    color: #e2e8f0;
    font-weight: 600;
    text-align: left;
    padding: 6px 9px;
    border: 1px solid #16243a;
  }
  td {
    padding: 5px 9px;
    border: 1px solid #cdd5e0;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f4f6fa; }

  /* First table in the doc is the metadata block — style it lighter */
  .content > table:first-of-type th { display: none; }
  .content > table:first-of-type td:first-child {
    font-weight: 600;
    color: #16243a;
    width: 110px;
    background: #eef1f6;
  }

  .footer-note {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #d8dee7;
    font-family: Consolas, monospace;
    font-size: 7pt;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
  }
`;

function htmlTemplate(doc, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CINERNET — ${doc.title}</title>
<style>${css}</style>
</head>
<body>
  <div class="cover">
    <div class="brand">CINERNET · Electrical Topology Platform</div>
    <h1>${doc.title}</h1>
    <div class="subtitle">${doc.subtitle}</div>
    <div class="meta">
      <span><b>Site</b>&nbsp; Cinerglass Lommel</span>
      <span><b>Date</b>&nbsp; ${DATE}</span>
      <span><b>Status</b>&nbsp; Living document</span>
      <span><b>Repo</b>&nbsp; github.com/Explodingding/cinernet</span>
    </div>
  </div>
  <div class="content">
${body}
  </div>
  <div class="footer-note">
    <span>CINERNET — ${doc.title}</span>
    <span>Generated ${DATE} · For internal engineering use</span>
  </div>
</body>
</html>`;
}

await mkdir(OUT_DIR, { recursive: true });

for (const doc of DOCS) {
  const mdSource = await readFile(path.join(ROOT, doc.md), 'utf-8');
  const body = marked.parse(mdSource, { gfm: true });
  const html = htmlTemplate(doc, body);

  const htmlPath = path.join(OUT_DIR, `${doc.out}.html`);
  const pdfPath = path.join(OUT_DIR, `${doc.out}.pdf`);
  await writeFile(htmlPath, html, 'utf-8');

  await execFileAsync(EDGE, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ]);

  console.log(`✓ ${pdfPath}`);
}
console.log('Done.');
