import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import CobrancaDigitalTituloDto from '../../dto/integracao/cobranca.digital.titulo.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import { normalizeExpedicaoItemSequenceKey } from '../../utils/expedicao.item.sequence';

export default class LocalSqlServerCobrancaDigitalTituloRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalTituloDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalTituloDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return CobrancaDigitalTituloDto.fromObject(item);
      });

      return entity;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalTituloDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return CobrancaDigitalTituloDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
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
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: CobrancaDigitalTituloDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: CobrancaDigitalTituloDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.titulo.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalTituloDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
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
        .input('Observacao', sql.VarChar(2000), entity.observacao?.substring(0, 2000))
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
