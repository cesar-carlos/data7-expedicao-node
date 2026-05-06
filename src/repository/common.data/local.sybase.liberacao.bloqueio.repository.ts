import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import LiberacaoBloqueioDto from '../../dto/common.data/liberacao.bloqueio.dto';
import LocalSybaseItemLiberacaoBloqueioRepository from './local.sybase.item.liberacao.bloqueio.repository';
import LocalSybaseIItemLiberacaoBloqueioSituacaoRepository from './local.sybase.item.liberacao.bloqueio.situacao.repository';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';

export default class LocalSybaseLiberacaoBloqueioRepository
  implements LocalBaseRepositoryContract<LiberacaoBloqueioDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');
  private itemLiberacaoBloqueioRepository = new LocalSybaseItemLiberacaoBloqueioRepository();
  private itemLiberacaoBloqueioSituacaoRepository = new LocalSybaseIItemLiberacaoBloqueioSituacaoRepository();

  public async select(): Promise<LiberacaoBloqueioDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'liberacao.bloqueio.select.sql');
    const sql = readSqlFileCached(patchSQL);
    const result = await pool.request().query(sql);
    pool.close();

    if (result?.length === 0) return [];
    const liberacoes: LiberacaoBloqueioDto[] = [];

    for (const item of result) {
      const params = [{ key: 'CodLiberacaoBloqueio', value: item.CodLiberacaoBloqueio }];
      const itemLiberacaoBloqueio = await this.itemLiberacaoBloqueioRepository.selectWhere(params);
      const itemLiberacaoBloqueioSituacao = await this.itemLiberacaoBloqueioSituacaoRepository.selectWhere(params);

      const liberacao = new LiberacaoBloqueioDto({
        codEmpresa: item.codEmpresa,
        codFilial: item.Codfilial,
        codLiberacaoBloqueio: item.CodLiberacaoBloqueio,
        origem: item.Origem,
        codOrigem: item.CodOrigem,
        codCliente: item.CodCliente,
        dataHoraBloqueio: item.DataHoraBloqueio,
        codUsuarioBloqueio: item.CodUsuarioBloqueio,
        nomeUsuarioBloqueio: item.NomeUsuarioBloqueio,
        estacaoTrabalhoBloqueio: item.EstacaoTrabalhoBloqueio,
        itemLiberacaoBloqueio: itemLiberacaoBloqueio ? itemLiberacaoBloqueio : [],
        itemLiberacaoBloqueioSituacao: itemLiberacaoBloqueioSituacao ? itemLiberacaoBloqueioSituacao : [],
      });

      liberacoes.push(liberacao);
    }

    return liberacoes;
  }

  public async selectWhere(params: Params[]): Promise<LiberacaoBloqueioDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'liberacao.bloqueio.select.sql');
    const select = readSqlFileCached(patchSQL);
    const _params = ParamsCommonRepository.build(params);
    const sql = `${select} WHERE ${_params}`;
    const result = await pool.request().query(sql);
    pool.close();

    if (result?.length === 0) return [];
    const liberacoes: LiberacaoBloqueioDto[] = [];

    for (const item of result) {
      const params = [{ key: 'CodLiberacaoBloqueio', value: item.CodLiberacaoBloqueio }];
      const itemLiberacaoBloqueio = await this.itemLiberacaoBloqueioRepository.selectWhere(params);
      const itemLiberacaoBloqueioSituacao = await this.itemLiberacaoBloqueioSituacaoRepository.selectWhere(params);

      const liberacao = new LiberacaoBloqueioDto({
        codEmpresa: item.CodEmpresa,
        codFilial: item.CodFilial,
        codLiberacaoBloqueio: item.CodLiberacaoBloqueio,
        origem: item.Origem,
        codOrigem: item.CodOrigem,
        codCliente: item.CodCliente,
        dataHoraBloqueio: item.DataHoraBloqueio,
        codUsuarioBloqueio: item.CodUsuarioBloqueio,
        nomeUsuarioBloqueio: item.NomeUsuarioBloqueio,
        estacaoTrabalhoBloqueio: item.EstacaoTrabalhoBloqueio,
        itemLiberacaoBloqueio: itemLiberacaoBloqueio ? itemLiberacaoBloqueio : [],
        itemLiberacaoBloqueioSituacao: itemLiberacaoBloqueioSituacao ? itemLiberacaoBloqueioSituacao : [],
      });

      liberacoes.push(liberacao);
    }

    return liberacoes;
  }

  public async insert(entity: LiberacaoBloqueioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'liberacao.bloqueio.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);

      entity.itemLiberacaoBloqueio.map(async (item) => {
        await this.itemLiberacaoBloqueioRepository.insert(item);
      });

      entity.itemLiberacaoBloqueioSituacao?.map(async (item) => {
        await this.itemLiberacaoBloqueioSituacaoRepository.insert(item);
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: LiberacaoBloqueioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'liberacao.bloqueio.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);

      entity.itemLiberacaoBloqueio.map(async (item) => {
        await this.itemLiberacaoBloqueioRepository.update(item);
      });

      entity.itemLiberacaoBloqueioSituacao?.map(async (item) => {
        await this.itemLiberacaoBloqueioSituacaoRepository.update(item);
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: LiberacaoBloqueioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'liberacao.bloqueio.select.sql');
      const delet = readSqlFileCached(patchSQL);

      for (const itemLiberacao of entity.itemLiberacaoBloqueio) {
        await this.itemLiberacaoBloqueioRepository.delete(itemLiberacao);
      }

      await this.actonEntity(entity, delet);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private async actonEntity(entity: LiberacaoBloqueioDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
        .input('CodEmpresa', sql.Int, entity.codEmpresa)
        .input('CodFilial', sql.Int, entity.codFilial)
        .input('CodLiberacaoBloqueio', sql.Int, entity.codLiberacaoBloqueio)
        .input('Origem', sql.VarChar(6), entity.origem.substring(0, 6))
        .input('CodOrigem', sql.Int, entity.codOrigem)
        .input('CodCliente', sql.Int, entity.codCliente)
        .input('DataHoraBloqueio', sql.DateTime, entity.dataHoraBloqueio)
        .input('CodUsuarioBloqueio', sql.Int, entity.codUsuarioBloqueio)
        .input('NomeUsuarioBloqueio', sql.VarChar(30), entity.nomeUsuarioBloqueio.substring(0, 20))
        .input('EstacaoTrabalhoBloqueio', sql.VarChar(30), entity.estacaoTrabalhoBloqueio.substring(0, 20))
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
