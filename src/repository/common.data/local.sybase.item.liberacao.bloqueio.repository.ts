import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { Params } from '../../contracts/local.base.params';
import { ConnectionSybase } from '../../infra/connection.sybase';

import ItemLiberacaoBloqueioDto from '../../dto/common.data/item.liberacao.bloqueio.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { normalizeExpedicaoItemSequenceKey } from '../../utils/expedicao.item.sequence';

export default class LocalSybaseItemLiberacaoBloqueioRepository
  implements LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');

  async select(): Promise<ItemLiberacaoBloqueioDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.select.sql');
    const sql = readSqlFileCached(patchSQL);
    const result = await pool.request().query(sql);
    pool.close();

    if (result.length === 0) return [];
    const entity = result.map((item: any) => {
      return ItemLiberacaoBloqueioDto.fromObject(item);
    });

    return entity;
  }

  async selectWhere(params: Params[]): Promise<ItemLiberacaoBloqueioDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.select.sql');
      const select = readSqlFileCached(patchSQL);

      const _params = ParamsCommonRepository.build(params);
      const sql = `${select} WHERE ${_params}`;
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const entitys = result.map((item: any) => {
        return ItemLiberacaoBloqueioDto.fromObject(item);
      });

      return entitys;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async insert(entity: ItemLiberacaoBloqueioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'item.liberacao.bloqueio.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const normalized = new ItemLiberacaoBloqueioDto({
        codLiberacaoBloqueio: entity.codLiberacaoBloqueio,
        item: normalizeExpedicaoItemSequenceKey(entity.item),
        status: entity.status,
        codRegra: entity.codRegra,
        regra: entity.regra,
        mensagemBloqueio: entity.mensagemBloqueio,
        descricaoBloqueio: entity.descricaoBloqueio,
        observacaoBloqueio: entity.observacaoBloqueio,
        dataHoraSolicitacao: entity.dataHoraSolicitacao,
        codUsuarioSolicitacao: entity.codUsuarioSolicitacao,
        nomeUsuarioSolicitacao: entity.nomeUsuarioSolicitacao,
        estacaoTrabalhoSolicitacao: entity.estacaoTrabalhoSolicitacao,
        observacaoLiberacaoBloqueio: entity.observacaoLiberacaoBloqueio,
        motivoRejeicaoLiberacaoBloqueio: entity.motivoRejeicaoLiberacaoBloqueio,
      });
      await this.actonEntity(normalized, insert);
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
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
