import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** bind literal -> DI_BIND property name */
const map = {
  "CreatePixApiContract": "DI_BIND.CreatePixApiContract",
  "ContractBaseRepository<CobrancaPix>": "DI_BIND.ContractBaseRepository_CobrancaPix",
  "ContractBaseRepository<PagamentoPix>": "DI_BIND.ContractBaseRepository_PagamentoPix",
  "DataBaseActiveContract<DatabaseOnlineDto>": "DI_BIND.DataBaseActiveContract_DatabaseOnlineDto",
  "LocalBaseRepositorySequenceContract<SequenceDto>": "DI_BIND.LocalBaseRepositorySequenceContract_SequenceDto",
  "LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>": "DI_BIND.LocalBaseRepositoryContract_ItemLiberacaoBloqueioDto",
  "LocalBaseRepositoryContract<CobrancaDigitalPixDto>": "DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto",
  "LocalBaseRepositoryContract<CobrancaDigitalTituloDto>": "DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto",
  "LocalBaseRepositoryContract<CobrancaDigitalPagamentoDto>": "DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPagamentoDto",
  "LocalBaseRepositoryContract<CobrancaDigitalDto>": "DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto",
  "LocalBaseRepositoryContract<EstoqueProdutoDto>": "DI_BIND.LocalBaseRepositoryContract_EstoqueProdutoDto",
  "LocalBaseRepositoryContract<ProcessoExecutavelDto>": "DI_BIND.LocalBaseRepositoryContract_ProcessoExecutavelDto",
  "LocalBaseRepositoryContract<UsuarioDto>": "DI_BIND.LocalBaseRepositoryContract_UsuarioDto",
  "LocalBaseRepositoryContract<EstoqueConversaoUnidadeDto>": "DI_BIND.LocalBaseRepositoryContract_EstoqueConversaoUnidadeDto",
  "LocalBaseConsultaRepositoryContract<EstoqueProdutoConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_EstoqueProdutoConsultaDto",
  "LocalBaseConsultaRepositoryContract<EstoqueConversaoUnidadeConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_EstoqueConversaoUnidadeConsultaDto",
  "LocalBaseConsultaRepositoryContract<UsuarioConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_UsuarioConsultaDto",
  "LocalBaseRepositoryContract<ExpedicaoCancelamentoDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoCancelamentoDto",
  "LocalBaseRepositoryContract<ExpedicaoSetorEstoqueDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoSetorEstoqueDto",
  "LocalBaseRepositoryContract<ExpedicaoPrioridadeDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoPrioridadeDto",
  "LocalBaseRepositoryContract<ExpedicaoMotivoRecusaDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoMotivoRecusaDto",
  "LocalBaseRepositoryContract<ExpedicaoCarrinhoDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoDto",
  "LocalBaseRepositoryContract<ExpedicaoTipoOperacaoExpedicaoDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoExpedicaoDto",
  "LocalBaseRepositoryContract<ExpedicaoTipoOperacaoArmazenagemDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoArmazenagemDto",
  "LocalBaseRepositoryContract<ExpedicaoArmazenarDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoArmazenarDto",
  "LocalBaseRepositoryContract<ExpedicaoItemArmazenarDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemArmazenarDto",
  "LocalBaseRepositoryContract<ExpedicaoSepararDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoSepararDto",
  "LocalBaseRepositoryContract<ExpedicaoConferirDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoConferirDto",
  "LocalBaseRepositoryContract<ExpedicaoItemSepararDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSepararDto",
  "LocalBaseRepositoryContract<ExpedicaoItemConferirDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferirDto",
  "LocalBaseRepositoryContract<ExpedicaoCarrinhoPercursoAgrupamento>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoAgrupamento",
  "LocalBaseRepositoryContract<ExpedicaoItemSeparacaoDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSeparacaoDto",
  "LocalBaseRepositoryContract<ExpedicaoItemConferenciaDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferenciaDto",
  "LocalBaseRepositoryContract<ExpedicaoCarrinhoPercursoDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoDto",
  "LocalBaseRepositoryContract<ExpedicaoCarrinhoPercursoEstagioDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoEstagioDto",
  "LocalBaseRepositoryContract<ExpedicaoPercursoEstagioDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoPercursoEstagioDto",
  "LocalBaseRepositoryContract<ExpedicaoSeparacaoUsuarioSetorDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoSeparacaoUsuarioSetorDto",
  "LocalBaseRepositoryContract<ExpedicaoLoginAppDto>": "DI_BIND.LocalBaseRepositoryContract_ExpedicaoLoginAppDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemArmazenarConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemArmazenarConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoCarrinhoPercursoEstagioConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoPercursoEstagioConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoCarrinhoConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoProgressoSeparacaoConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoProgressoSeparacaoConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoSeparacaoUsuarioSetorConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoSeparacaoUsuarioSetorConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoSepararConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoSepararConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoConferirConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoConferirConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoCarrinhoConferirConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConferirConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemSepararConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemSepararUnidadeMedidaConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararUnidadeMedidaConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemConferirConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferirConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemConferirUnidadeMedidaConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferirUnidadeMedidaConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemSeparacaoConferirConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoConferirConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemSeparacaoConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemSeparacaoResumoConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoResumoConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemConferenciaConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferenciaConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoCarrinhoPercursoAgrupamentoConsulta>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoPercursoAgrupamentoConsulta",
  "LocalBaseConsultaRepositoryContract<ExpedicaoLoginAppConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoLoginAppConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoVersaoAppConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoVersaoAppConsultaDto",
  "LocalBaseConsultaRepositoryContract<ExpedicaoItemImpressoConsultaDto>": "DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemImpressoConsultaDto",
};

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

function relImport(fromFile, toDirFile) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toDirFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\.ts$/, '');
}

function ensureImport(content, filePath, importPath, named) {
  if (content.includes(`from '${importPath}'`) || content.includes(`from "${importPath}"`)) return content;
  const line = `import { ${named} } from '${importPath}';\n`;
  const firstImport = content.search(/^import /m);
  if (firstImport === -1) return line + content;
  return content.slice(0, firstImport) + line + content.slice(firstImport);
}

const srcTs = walkDir(path.join(root, 'src')).filter((f) => !f.includes('bind.tokens.ts'));

for (const file of srcTs) {
  let text = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [literal, replacement] of Object.entries(map)) {
    const needle = `bind: '${literal}'`;
    const repl = `bind: ${replacement}`;
    if (text.includes(needle)) {
      text = text.split(needle).join(repl);
      changed = true;
    }
  }
  if (!changed) continue;

  const diBindPath = relImport(file, path.join(root, 'src/di/bind.tokens.ts'));
  text = ensureImport(text, file, diBindPath, 'DI_BIND');

  fs.writeFileSync(file, text);
  console.log('updated', path.relative(root, file));
}
