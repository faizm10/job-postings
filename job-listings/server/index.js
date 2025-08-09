/* minimal express server to read and update src/app/constants/companies.ts */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const COMPANIES_TS_PATH = path.join(__dirname, '..', 'src', 'app', 'constants', 'companies.ts');

function parseCompaniesFromTs(tsContent) {
  const match = tsContent.match(/export const\s+COMPANIES[\s\S]*?=\s*\[(>[\s\S]*?)?\];/);
  // more robust match allowing empty
  const insideArrayMatch = tsContent.match(/export const\s+COMPANIES[\s\S]*?=\s*\[(\s*[\s\S]*?)\];/);
  const inside = insideArrayMatch ? insideArrayMatch[1] : '';
  const objects = inside.match(/\{[\s\S]*?\}/g) || [];
  const companies = [];
  for (const obj of objects) {
    const nameMatch = obj.match(/companyName:\s*'([^']+)'/);
    const linkMatch = obj.match(/link:\s*'([^']+)'/);
    if (nameMatch && linkMatch) {
      companies.push({ companyName: nameMatch[1], link: linkMatch[1] });
    }
  }
  return companies;
}

function escapeSingleQuotes(text) {
  return String(text).replace(/'/g, "\\'");
}

app.get('/api/companies', (req, res) => {
  try {
    const content = fs.readFileSync(COMPANIES_TS_PATH, 'utf8');
    const companies = parseCompaniesFromTs(content);
    res.json(companies);
  } catch (err) {
    console.error('failed to read companies.ts', err);
    res.status(500).json({ error: 'failed_to_read' });
  }
});

app.post('/api/companies', (req, res) => {
  try {
    const { companyName, link } = req.body || {};
    if (!companyName || !link) {
      return res.status(400).json({ error: 'invalid_payload' });
    }
    const content = fs.readFileSync(COMPANIES_TS_PATH, 'utf8');
    const insertion = `  { companyName: '${escapeSingleQuotes(companyName)}', link: '${escapeSingleQuotes(link)}' },\n`;
    const replaced = content.replace(/\n\];\s*$/, `\n${insertion}];`);
    if (replaced === content) {
      // fallback: try to locate closing bracket line with spaces
      const idx = content.lastIndexOf(']');
      if (idx === -1) throw new Error('array_closing_bracket_not_found');
      const newContent = content.slice(0, idx) + `\n${insertion}` + content.slice(idx);
      fs.writeFileSync(COMPANIES_TS_PATH, newContent, 'utf8');
    } else {
      fs.writeFileSync(COMPANIES_TS_PATH, replaced, 'utf8');
    }
    const updated = fs.readFileSync(COMPANIES_TS_PATH, 'utf8');
    const companies = parseCompaniesFromTs(updated);
    res.status(201).json(companies);
  } catch (err) {
    console.error('failed to update companies.ts', err);
    res.status(500).json({ error: 'failed_to_update' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});


