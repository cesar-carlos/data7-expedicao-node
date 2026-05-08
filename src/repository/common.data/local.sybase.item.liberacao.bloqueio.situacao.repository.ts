import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import ItemLiberacaoBloqueioSituacaoDto from '../../dto/common.data/item.liberacao.bloqueio.situacao.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { normalizeExpedicaoItemSequenceKey } from '../../utils/expedicao.item.sequence';

export default class LocalSybaseItemLiberacaoBloqueioSituacaoRepository
  implements LocalBaseRepositoryContract<ItemLiberacaoBloqueioSituacaoDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');

  async select(): Promise<ItemLiberacaoBloqueioSituacaoDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.situacao.select.sql');
    const sql = readSqlFileCached(patchSQL);
    const result = await pool.request().query(sql);
    pool.close();

    if (result.length === 0) return [];
    const situacoes = result.map((item: any) => {
      return ItemLiberacaoBloqueioSituacaoDto.fromObject(item);
    });

    return situacoes;
  }

  async selectWhere(params: Params[]): Promise<ItemLiberacaoBloqueioSituacaoDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.situacao.select.sql');
    const select = readSqlFileCached(patchSQL);

    const _params = ParamsCommonRepository.build(params);
    const sql = `${select} WHERE ${_params}`;
    const result = await pool.request().query(sql);
    pool.close();

    if (result.length === 0) return [];
    const situacoes = result.map((item: any) => {
      return ItemLiberacaoBloqueioSituacaoDto.fromObject(item);
    });

    return situacoes;
  }

  async insert(entity: ItemLiberacaoBloqueioSituacaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.situacao.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const normalizedItem = normalizeExpedicaoItemSequenceKey(entity.item);
      const payload =
        normalizedItem === entity.item
          ? entity
          : new ItemLiberacaoBloqueioSituacaoDto({
              codLiberacaoBloqueio: entity.codLiberacaoBloqueio,
              item: normalizedItem,
              status: entity.status,
              rotinaLiberacao: entity.rotinaLiberacao,
              dataHoraLiberacao: entity.dataHoraLiberacao,
              codUsuarioLiberacao: entity.codUsuarioLiberacao,
              estacaoTrabalhoLiberacao: entity.estacaoTrabalhoLiberacao,
              observacaoLiberacao: entity.observacaoLiberacao,
              motivoRejeicaoLiberacaoBloqueio: entity.motivoRejeicaoLiberacaoBloqueio,
              complemento: entity.complemento,
            });
      await this.actonInsertEntity(payload, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
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
    await this.update(this.resetSituacao(entity));
  }

  private async actonInsertEntity(entity: ItemLiberacaoBloqueioSituacaoDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction.request().query(`
            BEGIN
              CREATE VARIABLE @CodEmpresa VARCHAR(1) = '1';
              CREATE VARIABLE @CodFilial VARCHAR(1) = '1';
              CREATE VARIABLE @CodUsuario VARCHAR(1) = '1';
              CREATE VARIABLE @NomeUsuario VARCHAR(30) = 'ADMINISTRADOR';
              CREATE VARIABLE @CodEstacaoTrabalho VARCHAR(1) = '1';
              CREATE VARIABLE @EstacaoTrabalho VARCHAR(30) = 'SERVIDOR';
            END;
      `);

      await transaction
        .request()
        .input('CodLiberacaoBloqueio', sql.Int, entity.codLiberacaoBloqueio)
        .input('Item', sql.VarChar(5), entity.item)
        .input('Status', sql.VarChar(3), entity.status.substring(0, 3))
        .input('RotinaLiberacao', sql.VarChar(20), entity.rotinaLiberacao?.substring(0, 20))
        .input('DataHoraLiberacao', sql.DateTime, entity.dataHoraLiberacao)
        .input('CodUsuarioLiberacao', sql.Int, entity.codUsuarioLiberacao)
        .input('EstacaoTrabalhoLiberacao', sql.VarChar(20), entity.estacaoTrabalhoLiberacao?.substring(0, 20))
        .input('ObservacaoLiberacao', sql.VarChar(2000), entity.observacaoLiberacao?.substring(0, 2000))
        .input('MotivoRejeicaoLiberacaoBloqueio', sql.VarChar(2000), entity.motivoRejeicaoLiberacaoBloqueio ?? '')
        .input('Complemento', sql.VarChar(2000), entity.complemento ?? '')
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }

  private async actonEntity(entity: ItemLiberacaoBloqueioSituacaoDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
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
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
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
