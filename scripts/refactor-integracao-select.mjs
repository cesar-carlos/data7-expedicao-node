import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const integ = path.join(root, 'src/repository/integracao');

const files = fs.readdirSync(integ).filter((f) => f.startsWith('local.sql.server') && f.endsWith('.ts'));

const block =
  /const _params = ParamsCommonRepository\.build\(params\);\s*const sql = _params \? `\$\{select\} WHERE \$\{_params\}` : select;\s*const result = await pool\.request\(\)\.query\(sql\);/;

for (const f of files) {
  const fp = path.join(integ, f);
  let t = fs.readFileSync(fp, 'utf8');
  const orig = t;
  t = t.replace(
    block,
    'const result = await executeSelectWhere(pool, select, params, undefined, undefined);',
  );
  if (t === orig) continue;
  if (!t.includes('consulta.sql.helper')) {
    t = t.replace(
      /import ParamsCommonRepository from '\.\.\/common\/params\.common';/,
      `import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';`,
    );
  }
  t = t.replace(
    /catch \(error: any\) \{\s*throw new Error\(error\.message\);\s*\}/g,
    'catch (error: unknown) {\n      throw wrapRepositoryError(error);\n    }',
  );
  fs.writeFileSync(fp, t);
  console.log(f);
}
