import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import CobrancaDigitalTituloDto from '../../dto/integracao/cobranca.digital.titulo.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { normalizeExpedicaoItemSequenceKey } from '../../utils/expedicao.item.sequence';

export default class LocalSybaseCobrancaDigitalTituloRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalTituloDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalTituloDto[]> {
    try {
      const connection = await this.connect.getConnection();
      const pool = await connection.connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const entity = result.map((item: any) => {
        return CobrancaDigitalTituloDto.fromObject(item);
      });

      return entity;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalTituloDto[]> {
    try {
      const connection = await this.connect.getConnection();
      const pool = await connection.connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.select.sql');
      const select = readSqlFileCached(patchSQL);

      const _params = ParamsCommonRepository.build(params);
      const sql = _params ? `${select} WHERE ${_params}` : select;
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const entitys = result.map((item: any) => {
        return CobrancaDigitalTituloDto.fromObject(item);
      });

      return entitys;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async insert(entity: CobrancaDigitalTituloDto): Promise<void> {
    try {
      const normalized = new CobrancaDigitalTituloDto({
        codEmpresa: entity.codEmpresa,
        codCobrancaDigital: entity.codCobrancaDigital,
        item: normalizeExpedicaoItemSequenceKey(entity.item),
        sysId: entity.sysId,
        status: entity.status,
        tipoCobranca: entity.tipoCobranca,
        numeroTitulo: entity.numeroTitulo,
        parcela: entity.parcela,
        qtdParcelas: entity.qtdParcelas,
        liberacaoKey: entity.liberacaoKey,
        dataLancamento: entity.dataLancamento,
        dataEmissao: entity.dataEmissao,
        dataVenda: entity.dataVenda,
        dataVencimento: entity.dataVencimento,
        valor: entity.valor,
        observacao: entity.observacao,
      });
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(normalized, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: CobrancaDigitalTituloDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: CobrancaDigitalTituloDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalTituloDto, sqlCommand: string): Promise<void> {
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
        .input('CodEmpresa', sql.Int, entity.codEmpresa)
        .input('CodCobrancaDigital', sql.Int, entity.codCobrancaDigital)
        .input('Item', sql.VarChar(3), entity.item)
        .input('SysId', sql.VarChar(500), entity.sysId?.substring(0, 500))
        .input('Status', sql.VarChar(6), entity.status?.substring(0, 6))
        .input('TipoCobranca', sql.VarChar(30), entity.tipoCobranca?.substring(0, 30))
        .input('NumeroTitulo', sql.VarChar(50), entity.numeroTitulo?.substring(0, 50))
        .input('Parcela', sql.VarChar(10), entity.parcela?.substring(0, 10))
        .input('QtdParcelas', sql.Int, entity.qtdParcelas)
        .input('LiberacaoKey', sql.VarChar(500), entity.liberacaoKey?.substring(0, 500))
        .input('DataLancamento', sql.Date, entity.dataLancamento)
        .input('DataEmissao', sql.Date, entity.dataEmissao)
        .input('DataVenda', sql.Date, entity.dataVenda)
        .input('DataVencimento', sql.Date, entity.dataVencimento)
        .input('Valor', sql.Money, entity.valor)
        .input('Observacao', sql.VarChar(2000), entity.observacao?.substring(0, 2000) || '')
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
