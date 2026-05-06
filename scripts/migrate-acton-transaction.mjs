/**
 * Migra actonEntity simples de sql.Transaction para ConnectionSqlServerMssql.executeInTransaction.
 * Ignora arquivos com actonEntityWithReturn (conversão manual).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const repositoryDir = path.join(root, 'src/repository');

function walkTs(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTs(full, acc);
    else if (ent.name.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

const openOld =
  /    const pool: ConnectionPool = await this\.connect\.getConnection\(\);\s+const transaction = new sql\.Transaction\(pool\);\s+try \{\s+await transaction\.begin\(\);\s+await transaction\s*\.request\(\)/g;

const commitOld = /      await transaction\.commit\(\);/g;

const catchOld =
  /\} catch \(error: any\) \{[^}]*await transaction\.rollback\(\);[^}]*throw new Error\(error\.message\);\s*\}/gs;

function migrateFile(fp) {
  let text = fs.readFileSync(fp, 'utf8');
  if (!text.includes('new sql.Transaction')) return false;
  if (text.includes('actonEntityWithReturn')) return false;

  const orig = text;
  text = text.replace(openOld, () => {
    return `    try {\n      await this.connect.executeInTransaction(async (request) => {\n        await request`;
  });

  text = text.replace(commitOld, '      });');

  text = text.replace(catchOld, () => {
    return `} catch (error: unknown) {\n      throw wrapRepositoryError(error);\n    }`;
  });

  if (text === orig) return false;

  if (text.includes('wrapRepositoryError') && !text.includes("from '../../utils/repository.error'") && !text.includes('from "../../utils/repository.error"')) {
    text = text.replace(
      /import ParamsCommonRepository from '\.\.\/common\/params\.common';/,
      `import ParamsCommonRepository from '../common/params.common';
import { wrapRepositoryError } from '../../utils/repository.error';`,
    );
    if (!text.includes('wrapRepositoryError')) {
      text = text.replace(
        /(import ConnectionSqlServerMssql[^\n]+\n)/,
        `$1import { wrapRepositoryError } from '../../utils/repository.error';\n`,
      );
    }
  }

  fs.writeFileSync(fp, text);
  return true;
}

let n = 0;
for (const fp of walkTs(repositoryDir)) {
  if (migrateFile(fp)) {
    console.log(path.relative(root, fp));
    n++;
  }
}
console.log('migrated', n);
