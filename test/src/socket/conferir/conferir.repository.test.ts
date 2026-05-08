import fs from 'fs';
import path from 'path';
import { expect, test, describe, beforeAll } from 'vitest';

import App from '../../../../src/aplication/app';
import ConferirRepository from '../../../../src/socket/conferir/conferir.repository';
import ExpedicaoConferirDto from '../../../../src/dto/expedicao/expedicao.conferir.dto';

describe('Teste conferencia de pedidos repository', () => {
  beforeAll(() => async () => {});

  test.skip('Deve consultar as conferencia', async () => {
    const app = new App();
    app.execute();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const repository = new ConferirRepository();
    const models = await repository.consulta();
    expect(models).toBeInstanceOf(Array);
  });

  test.skip('Deve inserir uma conferencia', async () => {
    const app = new App();
    app.execute();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const repository = new ConferirRepository();
    const patchConferirAssets = path.resolve(__dirname, './assets/conferir.assets.json');
    const conferirAssets = JSON.parse(fs.readFileSync(patchConferirAssets).toString());
    const conferir = ExpedicaoConferirDto.fromObject(conferirAssets);

    await expect(repository.insert([conferir])).rejects.toThrow();
  });
});
