import Filial from './filial';
import Usuario from './usuario';
import Cliente from './cliente';
import Parcela from './cobranca.parcela';

export default class Cobranca {
  constructor(
    readonly id: string,
    readonly usuario: Usuario,
    readonly filial: Filial,
    readonly cliente: Cliente,
    readonly parcelas: Parcela[],
  ) {}
}
