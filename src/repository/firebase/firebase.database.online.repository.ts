import FirebaseBaseRepository from './firebase.base.repository';
import DataBaseActiveContract from '../../contracts/data.base.active.contract';
import DatabaseOnlineDto from '../../dto/common.data/database.online.dto';

export default class FirebaseDatabaseOnlineRepository
  extends FirebaseBaseRepository
  implements DataBaseActiveContract<DatabaseOnlineDto>
{
  readonly collection = 'webhook-register';
  async getDataBaseInfo(): Promise<DatabaseOnlineDto | string> {
    try {
      const query = this.db.collection(this.collection).limit(1).get();
      const ref = await query;

      if (!ref) return 'Falha ao obter informacoes da base de dados (On-Line: FireBase).';
      const databaseOnlineDto = new DatabaseOnlineDto({ base: 'FireBase', versao: '' });
      return databaseOnlineDto;
    } catch (error: any) {
      return `Falha ao obter informacoes da base de dados (On-Line: FiraBase). ${error.message}`;
    }
  }
}
