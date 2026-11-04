import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { ComparisonOperator, Params } from '../../../../src/contracts/local.base.params';
import {
  buildSeparacaoUsuarioSetorConsultaQuery,
  separacaoUsuarioSetorConsultaSql,
} from '../../../../src/repository/expedicao/separacao.usuario.setor.consulta.query';

describe('consulta de separacao por usuario e setor', () => {
  it('mantem o SQL sem filtro igual ao arquivo publicado', () => {
    const file = readFileSync(
      path.resolve(
        __dirname,
        '../../../../src/sql/expedicao/expedicao.separacao.usuario.setor.consulta.sql',
      ),
      'utf8',
    );
    expect(file.replace(/\r\n/g, '\n').trim()).toBe(separacaoUsuarioSetorConsultaSql().trim());
  });

  it('comeca pelo usuario quando o filtro e CodUsuario', () => {
    const query = buildSeparacaoUsuarioSetorConsultaQuery([Params.equals('CodUsuario', 15)]);

    expect(query.sql).toContain('FROM Expedicao.SeparacaoUsuarioSetor sut');
    expect(query.sql).not.toContain('LEFT JOIN Expedicao.SeparacaoUsuarioSetor sut');
    expect(query.sql).toContain('sut.CodUsuario = @push_');
    expect(query.sql).toContain('SUM(sise.Quantidade) QuantidadeItens');
    expect(query.sql).toContain('FROM Expedicao.SeparacaoUsuarioSetor sutTot');
    expect(query.outerParams).toEqual([]);
  });

  it('deixa filtro de quantidade fora do agrupamento', () => {
    const query = buildSeparacaoUsuarioSetorConsultaQuery([
      Params.equals('CodEmpresa', 1),
      { key: 'QuantidadeItensSetor', value: 0, operator: ComparisonOperator.GREATER_THAN },
    ]);

    expect(query.sql).toContain('ise.CodEmpresa = @push_');
    expect(query.sql).not.toContain('QuantidadeItensSetor >');
    expect(query.outerParams).toEqual([
      { key: 'QuantidadeItensSetor', value: 0, operator: ComparisonOperator.GREATER_THAN },
    ]);
  });

  it('nao empurra LIKE para dentro da leitura', () => {
    const like = { key: 'CodUsuario', value: '%15%', operator: ComparisonOperator.LIKE };
    const query = buildSeparacaoUsuarioSetorConsultaQuery([like]);

    expect(query.sql).toContain('LEFT JOIN Expedicao.SeparacaoUsuarioSetor sut');
    expect(query.sql).not.toContain('@push_');
    expect(query.outerParams).toEqual([like]);
  });

  it('deixa o setor fora quando nao ha usuario para reduzir a leitura', () => {
    const setor = Params.equals('CodSetorEstoque', 3);
    const query = buildSeparacaoUsuarioSetorConsultaQuery([setor]);

    expect(query.sql).toBe(separacaoUsuarioSetorConsultaSql());
    expect(query.outerParams).toEqual([setor]);
  });

  it('aplica usuario e setor antes de somar os pedidos desse usuario', () => {
    const query = buildSeparacaoUsuarioSetorConsultaQuery([
      Params.equals('CodUsuario', 15),
      Params.equals('CodSetorEstoque', 3),
    ]);

    expect(query.sql).toContain('ise.CodSetorEstoque = @push_');
    expect(query.sql).toContain('sutTot.CodSetorEstoque = @push_');
    expect(query.sql).toContain('SUM(sise.Quantidade) QuantidadeItens');
    expect(query.outerParams).toEqual([]);
  });
});
