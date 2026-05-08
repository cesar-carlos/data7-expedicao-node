import FirebaseBaseRepository from './firebase.base.repository';
import ContractBaseRepository from '../../contracts/base.repository.contract';
import PagamentoPix from '../../entities/pagamento.pix';

export default class FirebasePagamentoPixRepository
  extends FirebaseBaseRepository
  implements ContractBaseRepository<PagamentoPix>
{
  readonly collection = 'pagamentos-pix';

  async find(EndToEndId: string): Promise<PagamentoPix | undefined> {
    try {
      const query = this.db
        .collection(this.collection)
        .where('Chave', '==', process.env.CHAVE_PIX)
        .where('EndToEndId', '==', EndToEndId)
        .get();
      const docRef = await query;
      const data = docRef.docs.map((doc) => {
        return { ...doc.data() };
      });

      if (!data) return undefined;

      const pagamentosPix = data.map((item) => {
        return new PagamentoPix({
          txid: item.Txid,
          endToEndId: item.EndToEndId,
          chave: item.Chave,
          horario: new Date(item.Horario),
          valor: item.Valor,
          infoPagador: item.InfoPagador,
        });
      });

      return pagamentosPix.shift();
    } catch (error: any) {
      throw new Error(error).message;
    }
  }

  async findWhere(key: string, value: string): Promise<PagamentoPix[]> {
    try {
      const query = this.db
        .collection(this.collection)
        .where('Chave', '==', process.env.CHAVE_PIX)
        .where(key, '==', value)
        .get();

      const docRef = await query;
      const data = docRef.docs.map((doc) => {
        return { ...doc.data() };
      });

      if (!data) return [];

      const pagamentosPix = data.map((item) => {
        return new PagamentoPix({
          txid: item.Txid,
          endToEndId: item.EndToEndId,
          chave: item.Chave,
          horario: new Date(item.Horario),
          valor: item.Valor,
          infoPagador: item.InfoPagador,
        });
      });

      return pagamentosPix;
    } catch (error: any) {
      throw new Error(error).message;
    }
  }

  async findAll(): Promise<PagamentoPix[]> {
    throw new Error('Method not implemented.');
  }

  async insert(data: PagamentoPix): Promise<void> {
    try {
      const docRef = this.db.collection(this.collection).doc();
      await docRef.set(JSON.parse(JSON.stringify(data)));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async update(data: PagamentoPix): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
