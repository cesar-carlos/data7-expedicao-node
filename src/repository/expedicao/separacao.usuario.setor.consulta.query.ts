import path from 'path';
import sql from 'mssql';
import type { Request } from 'mssql';

import { ComparisonOperator, Param, Params } from '../../contracts/local.base.params';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import ParamsCommonRepository from '../common/params.common';

type SqlBinding = {
  name: string;
  type: sql.ISqlType | sql.ISqlTypeFactory;
  value: unknown;
};

export type SeparacaoUsuarioSetorConsultaQuery = {
  sql: string;
  outerParams: Param[];
  apply: (request: Request) => void;
};

const PUSHABLE_OPERATORS = new Set<string>([
  ComparisonOperator.EQUALS,
  ComparisonOperator.IN,
  ComparisonOperator.IS_NULL,
  ComparisonOperator.IS_NOT_NULL,
]);

const USER_SEEK_OPERATORS = new Set<string>([
  ComparisonOperator.EQUALS,
  ComparisonOperator.IN,
  ComparisonOperator.IS_NOT_NULL,
]);

/**
 * Filtros de usuario, empresa, separacao e setor entram antes do agrupamento.
 * QuantidadeItens continua a soma de todos os itens da separacao, nao so do setor filtrado.
 */
export function buildSeparacaoUsuarioSetorConsultaQuery(params: Param[] = []): SeparacaoUsuarioSetorConsultaQuery {
  if (!ParamsCommonRepository.isParamObjectArray(params) || ParamsCommonRepository.needsLegacyWhere(params)) {
    return { sql: separacaoUsuarioSetorConsultaSql(), outerParams: params, apply: () => {} };
  }

  const bindings: SqlBinding[] = [];
  let parameterIndex = 0;
  const bind = (value: unknown): string => {
    const name = `push_${parameterIndex++}`;
    bindings.push({ name, type: inferSqlType(value), value });
    return `@${name}`;
  };

  const pushed = new Set<Param>();
  const predicate = (column: string, param: Param): string | undefined => {
    const operator = param.operator || ComparisonOperator.EQUALS;
    if (!PUSHABLE_OPERATORS.has(operator) || !Params.isValid(param)) return undefined;
    pushed.add(param);
    if (operator === ComparisonOperator.IS_NULL) return `${column} IS NULL`;
    if (operator === ComparisonOperator.IS_NOT_NULL) return `${column} IS NOT NULL`;
    if (operator === ComparisonOperator.IN) {
      const values = Array.isArray(param.value) ? param.value : [];
      if (values.length === 0) return '1 = 0';
      return `${column} IN (${values.map((value) => bind(value)).join(', ')})`;
    }
    return `${column} = ${bind(param.value)}`;
  };

  const of = (key: string): Param[] => params.filter((param) => param.key === key);
  const sqlOf = (key: string, column: string): string[] =>
    of(key)
      .map((param) => predicate(column, param))
      .filter((fragment): fragment is string => Boolean(fragment));

  const userParams = of('CodUsuario');
  const userSeek =
    userParams.length > 0 &&
    userParams.every((param) => USER_SEEK_OPERATORS.has(param.operator || ComparisonOperator.EQUALS));

  const baseFilter = [
    ...sqlOf('CodEmpresa', 'ise.CodEmpresa'),
    ...sqlOf('CodSepararEstoque', 'ise.CodSepararEstoque'),
    ...sqlOf('SepararEstoqueSituacao', 'se.Situacao'),
    ...(userSeek ? sqlOf('CodSetorEstoque', 'ise.CodSetorEstoque') : []),
    ...sqlOf('CodUsuario', 'sut.CodUsuario'),
  ];
  const totOrderFilter = [
    ...sqlOf('CodEmpresa', 'sise.CodEmpresa'),
    ...sqlOf('CodSepararEstoque', 'sise.CodSepararEstoque'),
    ...sqlOf('SepararEstoqueSituacao', 'seTot.Situacao'),
  ];
  const pedidoFilter = userSeek
    ? [...sqlOf('CodUsuario', 'sutTot.CodUsuario'), ...sqlOf('CodSetorEstoque', 'sutTot.CodSetorEstoque')]
    : [];
  const abertoFilter = [
    ...sqlOf('CodEmpresa', 'cpe.CodEmpresa'),
    ...sqlOf('CodSepararEstoque', 'cpe.CodOrigem'),
    ...(userSeek ? sqlOf('CodUsuario', 'cpe.CodUsuarioInicio') : []),
  ];

  if (!userSeek && baseFilter.length === 0 && totOrderFilter.length === 0) {
    return { sql: separacaoUsuarioSetorConsultaSql(), outerParams: params, apply: () => {} };
  }

  return {
    sql: consultaSql({
      userSeek,
      baseFilter,
      totOrderFilter,
      pedidoFilter,
      abertoFilter,
    }),
    outerParams: params.filter((param) => !pushed.has(param)),
    apply: (request) => {
      for (const binding of bindings) {
        request.input(binding.name, binding.type as Parameters<Request['input']>[1], binding.value);
      }
    },
  };
}

export function separacaoUsuarioSetorConsultaSql(): string {
  const patch = path.resolve(
    ParamsCommonRepository.basePatchSQL('expedicao'),
    'expedicao.separacao.usuario.setor.consulta.sql',
  );
  return readSqlFileCached(patch);
}

function consultaSql(input: {
  userSeek: boolean;
  baseFilter: string[];
  totOrderFilter: string[];
  pedidoFilter: string[];
  abertoFilter: string[];
}): string {
  const and = (fragments: string[]) => fragments.map((fragment) => `        AND ${fragment}`).join('\n');

  const pedidoJoin = input.userSeek
    ? `
        INNER JOIN (
            SELECT DISTINCT
                sutTot.CodEmpresa,
                sutTot.CodSepararEstoque
            FROM Expedicao.SeparacaoUsuarioSetor sutTot
            WHERE 1 = 1
${and(input.pedidoFilter)}
        ) pedidosTot ON
            pedidosTot.CodEmpresa = sise.CodEmpresa
        AND pedidosTot.CodSepararEstoque = sise.CodSepararEstoque`
    : '';

  const baseFrom = input.userSeek
    ? `
        FROM Expedicao.SeparacaoUsuarioSetor sut
        INNER JOIN Expedicao.ItemSepararEstoque ise ON
            ise.CodEmpresa = sut.CodEmpresa
        AND ise.CodSepararEstoque = sut.CodSepararEstoque
        AND ise.CodSetorEstoque = sut.CodSetorEstoque
        INNER JOIN Expedicao.SepararEstoque se ON
            se.CodEmpresa = ise.CodEmpresa
        AND se.CodSepararEstoque = ise.CodSepararEstoque
        LEFT JOIN Expedicao.Prioridade prio ON
            prio.CodPrioridade = se.CodPrioridade
        INNER JOIN Produto prod ON
            prod.CodProduto = ise.CodProduto
        LEFT JOIN Expedicao.SetorEstoque ese ON
            ese.CodSetorEstoque = ise.CodSetorEstoque`
    : `
        FROM Expedicao.ItemSepararEstoque ise
        INNER JOIN Expedicao.SepararEstoque se ON
            se.CodEmpresa = ise.CodEmpresa
        AND se.CodSepararEstoque = ise.CodSepararEstoque
        LEFT JOIN Expedicao.Prioridade prio ON
            prio.CodPrioridade = se.CodPrioridade
        INNER JOIN Produto prod ON
            prod.CodProduto = ise.CodProduto
        LEFT JOIN Expedicao.SeparacaoUsuarioSetor sut ON
            sut.CodEmpresa = ise.CodEmpresa
        AND sut.CodSepararEstoque = ise.CodSepararEstoque
        AND sut.CodSetorEstoque = ise.CodSetorEstoque
        LEFT JOIN Expedicao.SetorEstoque ese ON
            ese.CodSetorEstoque = ise.CodSetorEstoque`;

  return `SELECT *
FROM (
    SELECT
        base.CodEmpresa,
        base.CodSepararEstoque,
        base.SepararEstoqueSituacao,
        base.CodSetorEstoque,
        base.DescricaoSetorEstoque,
        base.CodPrioridade,
        base.DescricaoPrioridade,
        base.Prioridade,
        MAX(tot.QuantidadeItens) QuantidadeItens,
        MAX(tot.QuantidadeItensSeparacao) QuantidadeItensSeparacao,
        SUM(base.Quantidade) QuantidadeItensSetor,
        SUM(base.QuantidadeSeparacao) QuantidadeItensSeparacaoSetor,
        MAX(CASE WHEN aberto.CodEmpresa IS NOT NULL THEN 'S' ELSE 'N' END) CarrinhosAbertosUsuario,
        base.CodUsuario,
        base.NomeUsuario,
        base.EstacaoSeparacao
    FROM (
        SELECT
            ise.CodEmpresa,
            ise.CodSepararEstoque,
            se.Situacao SepararEstoqueSituacao,
            ise.CodSetorEstoque,
            ese.Descricao DescricaoSetorEstoque,
            prio.CodPrioridade,
            prio.Descricao DescricaoPrioridade,
            prio.Prioridade,
            ise.Quantidade,
            ise.QuantidadeSeparacao,
            sut.CodUsuario,
            sut.NomeUsuario,
            sut.EstacaoSeparacao
${baseFrom}
        WHERE 1 = 1
${and(input.baseFilter)}
    ) base
    INNER JOIN (
        SELECT
            sise.CodEmpresa,
            sise.CodSepararEstoque,
            SUM(sise.Quantidade) QuantidadeItens,
            SUM(sise.QuantidadeSeparacao) QuantidadeItensSeparacao
        FROM Expedicao.ItemSepararEstoque sise
        INNER JOIN Expedicao.SepararEstoque seTot ON
            seTot.CodEmpresa = sise.CodEmpresa
        AND seTot.CodSepararEstoque = sise.CodSepararEstoque
${pedidoJoin}
        WHERE 1 = 1
${and(input.totOrderFilter)}
        GROUP BY
            sise.CodEmpresa,
            sise.CodSepararEstoque
    ) tot ON
        tot.CodEmpresa = base.CodEmpresa
    AND tot.CodSepararEstoque = base.CodSepararEstoque
    LEFT JOIN (
        SELECT
            cpe.CodEmpresa,
            cpe.CodOrigem,
            cpe.CodUsuarioInicio
        FROM Expedicao.CarrinhoPercursoEstagio cpe
        WHERE cpe.Origem = 'SE'
          AND cpe.Situacao NOT IN ('CANCELADA')
          AND cpe.DataFinalizacao IS NULL
${and(input.abertoFilter)}
        GROUP BY
            cpe.CodEmpresa,
            cpe.CodOrigem,
            cpe.CodUsuarioInicio
    ) aberto ON
        aberto.CodEmpresa = base.CodEmpresa
    AND aberto.CodOrigem = base.CodSepararEstoque
    AND aberto.CodUsuarioInicio = base.CodUsuario
    GROUP BY
        base.CodEmpresa,
        base.CodSepararEstoque,
        base.SepararEstoqueSituacao,
        base.CodSetorEstoque,
        base.DescricaoSetorEstoque,
        base.CodPrioridade,
        base.DescricaoPrioridade,
        base.Prioridade,
        base.CodUsuario,
        base.NomeUsuario,
        base.EstacaoSeparacao
) SeparacaoUsuarioSetorConsulta`;
}

function inferSqlType(value: unknown): sql.ISqlType | sql.ISqlTypeFactory {
  if (value === null || value === undefined) return sql.NVarChar(sql.MAX);
  if (typeof value === 'boolean') return sql.Bit;
  if (typeof value === 'number') {
    return Number.isInteger(value) && Math.abs(value) <= 2147483647 ? sql.Int : sql.Float;
  }
  if (value instanceof Date) return sql.DateTime2(7);
  if (typeof value === 'string') return sql.NVarChar(sql.MAX);
  if (Buffer.isBuffer(value)) return sql.VarBinary(sql.MAX);
  return sql.NVarChar(sql.MAX);
}
