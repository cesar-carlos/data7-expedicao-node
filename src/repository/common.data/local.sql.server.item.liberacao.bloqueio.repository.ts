import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ItemLiberacaoBloqueioDto from '../../dto/common.data/item.liberacao.bloqueio.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';

export default class LocalSqlServerItemLiberacaoBloqueioRepository
  implements LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');

  async select(): Promise<ItemLiberacaoBloqueioDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const itensLiberacoes = result.recordset.map((item: any) => {
        return ItemLiberacaoBloqueioDto.fromObject(item);
      });

      return itensLiberacoes;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }

  async selectWhere(params: Params[]): Promise<ItemLiberacaoBloqueioDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const itensLiberacoes = result.recordset.map((item: any) => {
        return ItemLiberacaoBloqueioDto.fromObject(item);
      });

      return itensLiberacoes;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }

  async insert(entity: ItemLiberacaoBloqueioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async update(entity: ItemLiberacaoBloqueioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async delete(entity: ItemLiberacaoBloqueioDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ItemLiberacaoBloqueioDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodLiberacaoBloqueio', sql.Int, entity.codLiberacaoBloqueio)
        .input('Item', sql.VarChar(3), entity.item)
        .input('Status', sql.VarChar(1), entity.status.substring(0, 1))
        .input('CodRegra', sql.Int, entity.codRegra)
        .input('Regra', sql.VarChar(30), entity.regra)
        .input('MensagemBloqueio', sql.VarChar(200), entity.mensagemBloqueio.substring(0, 200))
        .input('DescricaoBloqueio', sql.VarChar(200), entity.descricaoBloqueio.substring(0, 200))
        .input('ObservacaoBloqueio', sql.VarChar(2000), entity.observacaoBloqueio.substring(0, 2000))
        .input('DataHoraSolicitacao', sql.DateTime, entity.dataHoraSolicitacao)
        .input('CodUsuarioSolicitacao', sql.Int, entity.codUsuarioSolicitacao)
        .input('NomeUsuarioSolicitacao', sql.VarChar(20), entity.nomeUsuarioSolicitacao.substring(0, 20))
        .input('EstacaoTrabalhoSolicitacao', sql.VarChar(20), entity.estacaoTrabalhoSolicitacao.substring(0, 20))
        .input('ObservacaoLiberacaoBloqueio', sql.VarChar(2000), entity.observacaoLiberacaoBloqueio.substring(0, 2000))
        .input(
          'MotivoRejeicaoLiberacaoBloqueio',
          sql.VarChar(2000),
          entity.motivoRejeicaoLiberacaoBloqueio.substring(0, 2000),
        )
        .query(sqlCommand);

      });
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }
}
