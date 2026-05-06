import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql, { ConnectionPool } from 'mssql';

import { Params } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import EstoqueProdutoDto from '../../dto/common.data/estoque.produto.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class LocalSqlServerEstoqueProdutoRepository implements LocalBaseRepositoryContract<EstoqueProdutoDto> {
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');

  async select(): Promise<EstoqueProdutoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'estoque.produto.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const situacoes = result.recordset.map((item: any) => {
        return EstoqueProdutoDto.fromObject(item);
      });

      return situacoes;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }

  async selectWhere(params: Params[]): Promise<EstoqueProdutoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'estoque.produto.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const situacoes = result.recordset.map((item: any) => {
        return EstoqueProdutoDto.fromObject(item);
      });

      return situacoes;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }

  async insert(entity: EstoqueProdutoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'estoque.produto.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async update(entity: EstoqueProdutoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'estoque.produto.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async delete(entity: EstoqueProdutoDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'estoque.produto.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: EstoqueProdutoDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodProduto', sql.Int, entity.CodProduto)
        .input('Nome', sql.VarChar(100), entity.Nome)
        .input('Descricao', sql.VarChar(2000), entity.Descricao)
        .input('Ativo', sql.VarChar(1), entity.Ativo)
        .input('CodTipoProduto', sql.VarChar(2), entity.CodTipoProduto)
        .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
        .input('DataCadastro', sql.Date, entity.DataCadastro)
        .input('CodGrupoProduto', sql.Int, entity.CodGrupoProduto)
        .input('CodMarca', sql.Int, entity.CodMarca)
        .input('CodClasseProduto', sql.VarChar(6), entity.CodClasseProduto)
        .input('CodConceitoProduto', sql.VarChar(6), entity.CodConceitoProduto)
        .input('ProdutoComposto', sql.VarChar(1), entity.ProdutoComposto)
        .input('CodigoReferencia', sql.VarChar(50), entity.CodigoReferencia)
        .input('CodigoOriginal', sql.VarChar(50), entity.CodigoOriginal)
        .input('CodigoFabricante', sql.VarChar(50), entity.CodigoFabricante)
        .input('CodLocalArmazenagem', sql.Int, entity.CodLocalArmazenagem)
        .input('CodSetorEstoque', sql.Int, entity.CodSetorEstoque)
        .input('MovimentaEstoque', sql.VarChar(1), entity.MovimentaEstoque)
        .input('OrigemMercadoria', sql.VarChar(50), entity.OrigemMercadoria)
        .input('PontoPedido', sql.Money, entity.PontoPedido)
        .input('Endereco', sql.VarChar(50), entity.Endereco)
        .input('Pesavel', sql.VarChar(1), entity.Pesavel)
        .input('PesoBruto', sql.Money, entity.PesoBruto)
        .input('PesoLiquido', sql.Money, entity.PesoLiquido)
        .input('PossuiNumeroSerie', sql.VarChar(1), entity.PossuiNumeroSerie)
        .input('ControlaLote', sql.VarChar(1), entity.ControlaLote)
        .input('NCM', sql.VarChar(8), entity.NCM)
        .input('PermiteVenda', sql.VarChar(1), entity.PermiteVenda)
        .input('CodGrupoTributacao', sql.Int, entity.CodGrupoTributacao)
        .input('PermiteNotaFiscal', sql.VarChar(3), entity.PermiteNotaFiscal)
        .input('PermiteDesconto', sql.VarChar(1), entity.PermiteDesconto)
        .input('MargemLucro', sql.Float, entity.MargemLucro)
        .input('PrecoVenda', sql.Float, entity.PrecoVenda)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
