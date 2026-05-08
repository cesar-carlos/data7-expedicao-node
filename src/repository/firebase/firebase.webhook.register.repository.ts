import FirebaseBaseRepository from './firebase.base.repository';
import ContractBaseRepository from '../../contracts/base.repository.contract';
import WebhookDto from '../../dto/integracao/webhook.dto';

export default class FirebaseWebhookRegisterRepository
  extends FirebaseBaseRepository
  implements ContractBaseRepository<WebhookDto>
{
  readonly collection = 'webhook-register';

  async find(id: string): Promise<WebhookDto | undefined> {
    try {
      const quere = this.db.collection(this.collection).doc(id).get();
      const respose = await quere;
      const data = respose.data();

      if (!data) return undefined;
      return new WebhookDto(data.cnpj_cpf, data.chave, data.webhookUrl, new Date(data.criacao));
    } catch (error: any) {
      throw new Error(error).message;
    }
  }

  findWhere(key: string, value: string): Promise<WebhookDto[]> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<WebhookDto[] | undefined> {
    throw new Error('Method not implemented.');
  }

  async insert(entity: WebhookDto): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc()
        .set({ ...entity });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async update(entity: WebhookDto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
