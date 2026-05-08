import { classToPlain } from 'class-transformer';

import CobrancaPix from '../../entities/cobranca.pix';
import CobrancaLiberacaoKey from '../../entities/cobranca.liberacao.key';
import ContractBaseRepository from '../../contracts/base.repository.contract';
import FirebaseBaseRepository from './firebase.base.repository';

export default class FirebaseCobrancaPixRepository
  extends FirebaseBaseRepository
  implements ContractBaseRepository<CobrancaPix>
{
  readonly collection = 'cobrancas-pix';
  readonly cnpj = process.env.CNPJ || '';

  async find(sysId: string): Promise<CobrancaPix | undefined> {
    try {
      const query = this.db
        .collection(this.collection)
        .where('liberacaoKey.cnpj', '==', this.cnpj)
        .where('sysId', '==', sysId)
        .get();

      const docRef = await query;
      const data = docRef.docs.map((doc) => {
        return { ...doc.data() };
      });

      if (!data || data.length === 0) return undefined;
      const cobrancaPix = this.cobrancaPixFromFirebase(data[0]);
      return cobrancaPix;
    } catch (error: any) {
      throw new Error(error).message;
    }
  }

  async findWhere(key: string, value: string): Promise<CobrancaPix[]> {
    try {
      const query = this.db
        .collection(this.collection)
        .where('liberacaoKey.cnpj', '==', this.cnpj)
        .where(key, '==', value)
        .get();

      const docRef = await query;
      const cobrancasPix = docRef.docs.map((doc) => {
        return this.cobrancaPixFromFirebase(doc.data());
      });

      return cobrancasPix;
    } catch (error: any) {
      throw new Error(error).message;
    }
  }

  async findAll(): Promise<CobrancaPix[]> {
    try {
      const query = this.db.collection(this.collection).where('liberacaoKey.cnpj', '==', this.cnpj).get();
      const docRef = await query;
      const cobrancasPix = docRef.docs.map((doc) => {
        return this.cobrancaPixFromFirebase(doc.data());
      });

      return cobrancasPix;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async insert(entity: CobrancaPix): Promise<void> {
    try {
      const docRef = this.db.collection(this.collection).doc();
      await docRef.set(classToPlain(entity, { exposeUnsetFields: false }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async update(entity: CobrancaPix): Promise<void> {
    try {
      const query = this.db
        .collection(this.collection)
        .where('liberacaoKey.cnpj', '==', this.cnpj)
        .where('sysId', '==', entity.sysId)
        .get();

      const docRef = await query;
      const docsId = docRef.docs.map((doc) => {
        return doc.id;
      });

      if (docsId.length > 0) {
        await this.db
          .collection(this.collection)
          .doc(docsId[0])
          .update(classToPlain(entity, { exposeUnsetFields: false }));
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async delete(sysId: string): Promise<void> {
    try {
      const query = this.db
        .collection(this.collection)
        .where('liberacaoKey.cnpj', '==', this.cnpj)
        .where('sysId', '==', sysId)
        .get();

      const docRef = await query;
      const docsId = docRef.docs.map((doc) => {
        return doc.id;
      });

      if (docsId.length > 0) {
        await this.db.collection(this.collection).doc(docsId[0]).delete();
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  //create object CobrancaPix from firebase
  private cobrancaPixFromFirebase(data: any): CobrancaPix {
    const datacriacao = data.datacriacao._seconds ? new Date(data.datacriacao._seconds * 1000) : data.datacriacao;

    const liberacao = new CobrancaLiberacaoKey({
      codEmpresa: data.liberacaoKey.codEmpresa,
      codFilial: data.liberacaoKey.codFilial,
      cnpj: data.liberacaoKey.cnpj,
      idLiberacao: data.liberacaoKey.idLiberacao,
      origem: data.liberacaoKey.origem,
      codOrigem: data.liberacaoKey.codOrigem,
      item: data.liberacaoKey.item,
      nomeUsuario: data.liberacaoKey.nomeUsuario,
      estacaoTrabalho: data.liberacaoKey.estacaoTrabalho,
      ip: data.liberacaoKey.ip,
    });

    const cobrancaPix = new CobrancaPix({
      sysId: data.sysId,
      txId: data.txId,
      STATUS: data.STATUS,
      datacriacao: datacriacao,
      parcela: data.parcela,
      valor: data.valor,
      linkQrCode: data.linkQrCode,
      imagemQrcode: data.imagemQrcode,
      nomeCliente: data.nomeCliente,
      telefone: data.telefone,
      eMail: data.eMail,
      liberacaoKey: liberacao,
    });

    return cobrancaPix;
  }
}
