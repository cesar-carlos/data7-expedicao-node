import moment from 'moment';

import { STATUS } from '../../type/status';
import CobrancaPix from '../../entities/cobranca.pix';
import CobrancaLiberacaoKey from '../../entities/cobranca.liberacao.key';
import FirebaseBaseRepository from './firebase.base.repository';

export default class FirebaseCobrancaPixListenRepository extends FirebaseBaseRepository {
  readonly collection = 'cobrancas-pix';
  readonly cnpj = process.env.CNPJ;

  listen(callback: (CobrancaPix: any) => void): void {
    try {
      this.db
        .collection(this.collection)
        .where('STATUS', 'in', [STATUS.CONCLUIDO, STATUS.CANCELADO_CLIENTE])
        .where('liberacaoKey.cnpj', '==', this.cnpj!)
        .where('datacriacao', '>', moment().subtract(1, 'day').toDate())
        .limit(25)
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const cobranca = this.cobrancaPixFromFirebase(data);
            callback(cobranca); // <--- aqui
          });
        });
    } catch (error: any) {
      console.log(error.message);
    }
  }

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
