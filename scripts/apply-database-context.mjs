import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function walkDir(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue;
      walkDir(p, files);
    } else if (name.endsWith('.ts')) files.push(p);
  }
  return files;
}

function relImport(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\.ts$/, '');
}

const LOCAL_RE = /context:\s*process\.env\.LOCAL_DATABASE\?\.toLocaleLowerCase\(\)\s+as\s+eContext/g;
const ONLINE_RE = /context:\s*process\.env\.ONLINE_DATABASE\?\.toLocaleLowerCase\(\)\s+as\s+eContext/g;

const dbCtxPath = path.join(root, 'src/di/database.context.ts');

for (const file of walkDir(path.join(root, 'src'))) {
  let text = fs.readFileSync(file, 'utf8');
  if (!LOCAL_RE.test(text) && !ONLINE_RE.test(text)) continue;

  LOCAL_RE.lastIndex = 0;
  ONLINE_RE.lastIndex = 0;
  text = text.replace(LOCAL_RE, 'context: getLocalDbContext()');
  text = text.replace(ONLINE_RE, 'context: getOnlineDbContext()');

  const needs = [];
  if (text.includes('getLocalDbContext()')) needs.push('getLocalDbContext');
  if (text.includes('getOnlineDbContext()')) needs.push('getOnlineDbContext');

  const impPath = relImport(file, dbCtxPath);
  const importLine = `import { ${needs.join(', ')} } from '${impPath}';`;

  const already = new RegExp(`from ['"]${impPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
  if (already.test(text)) {
    text = text.replace(
      new RegExp(
        `^import\\s*\\{[^}]*\\}\\s*from\\s*['"]${impPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];\\s*`,
        'm',
      ),
      importLine + '\n',
    );
  } else {
    const firstImport = text.search(/^import /m);
    const block = importLine + '\n';
    text = firstImport >= 0 ? text.slice(0, firstImport) + block + text.slice(firstImport) : block + text;
  }

  fs.writeFileSync(file, text);
  console.log('ctx', path.relative(root, file));
}
