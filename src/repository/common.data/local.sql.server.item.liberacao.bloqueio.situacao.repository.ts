import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ItemLiberacaoBloqueioSituacaoDto from '../../dto/common.data/item.liberacao.bloqueio.situacao.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class LocalSqlServerItemLiberacaoBloqueioSituacaoRepository
  implements LocalBaseRepositoryContract<ItemLiberacaoBloqueioSituacaoDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');

  async select(): Promise<ItemLiberacaoBloqueioSituacaoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.situacao.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const situacoes = result.recordset.map((item: any) => {
        return ItemLiberacaoBloqueioSituacaoDto.fromObject(item);
      });

      return situacoes;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }

  async selectWhere(params: Params[]): Promise<ItemLiberacaoBloqueioSituacaoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.situacao.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const situacoes = result.recordset.map((item: any) => {
        return ItemLiberacaoBloqueioSituacaoDto.fromObject(item);
      });

      return situacoes;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }

  async insert(entity: ItemLiberacaoBloqueioSituacaoDto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async update(entity: ItemLiberacaoBloqueioSituacaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.situacao.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async delete(entity: ItemLiberacaoBloqueioSituacaoDto): Promise<void> {
    this.update(this.resetSituacao(entity));
  }

  private async actonEntity(entity: ItemLiberacaoBloqueioSituacaoDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodLiberacaoBloqueio', sql.Int, entity.codLiberacaoBloqueio)
        .input('Item', sql.VarChar(3), entity.item.substring(0, 3))
        .input('Status', sql.VarChar(3), entity.status.substring(0, 3))
        .input('RotinaLiberacao', sql.VarChar(20), entity.rotinaLiberacao?.substring(0, 20))
        .input('DataHoraLiberacao', sql.DateTime, entity.dataHoraLiberacao)
        .input('CodUsuarioLiberacao', sql.Int, entity.codUsuarioLiberacao)
        .input('EstacaoTrabalhoLiberacao', sql.VarChar(20), entity.estacaoTrabalhoLiberacao?.substring(0, 20))
        .input('ObservacaoLiberacao', sql.VarChar(2000), entity.observacaoLiberacao?.substring(0, 2000))
        .input('MotivoRejeicaoLiberacaoBloqueio', sql.VarChar(2000), entity.motivoRejeicaoLiberacaoBloqueio)
        .input('Complemento', sql.VarChar(2000), entity.complemento)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  private resetSituacao(delSituacao: ItemLiberacaoBloqueioSituacaoDto): ItemLiberacaoBloqueioSituacaoDto {
    return new ItemLiberacaoBloqueioSituacaoDto({
      codLiberacaoBloqueio: delSituacao.codLiberacaoBloqueio,
      item: delSituacao.item,
      status: 'B',
      rotinaLiberacao: undefined,
      dataHoraLiberacao: undefined,
      codUsuarioLiberacao: undefined,
      estacaoTrabalhoLiberacao: undefined,
      observacaoLiberacao: undefined,
      motivoRejeicaoLiberacaoBloqueio: undefined,
      complemento: undefined,
    });
  }
}
