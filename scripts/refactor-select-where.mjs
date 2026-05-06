/**
 * Substitui selectWhere (build + concat) por executeSelectWhere nos repositórios SQL Server.
 * node scripts/refactor-select-where.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const repositoryDir = path.join(repoRoot, 'src', 'repository');

function walkTsFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTsFiles(full, acc);
    else if (ent.name.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

const blockPattern =
  /const _params = ParamsCommonRepository\.build\(params\);[\s\S]*?const result = await pool\.request\(\)\.query\(pagination \? sqlWithPagination : sqlWithoutPagination\);/;

let changed = 0;
for (const file of walkTsFiles(repositoryDir)) {
  const rel = path.relative(repositoryDir, file);
  if (rel.includes('local.sybase')) continue;
  blockPattern.lastIndex = 0;
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  text = text.replace(
    blockPattern,
    'const result = await executeSelectWhere(pool, select, params, pagination, orderBy);',
  );
  if (text === orig) continue;

  if (!text.includes("consulta.sql.helper")) {
    text = text.replace(
      /import ParamsCommonRepository from '\.\.\/common\/params\.common';/,
      `import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';`,
    );
  }

  text = text.replace(
    /catch \(error: any\) \{\s*throw new Error\(error\.message\);\s*\}/g,
    'catch (error: unknown) {\n      throw wrapRepositoryError(error);\n    }',
  );

  fs.writeFileSync(file, text);
  changed++;
  console.log(path.relative(repoRoot, file));
}

console.log('files updated:', changed);
