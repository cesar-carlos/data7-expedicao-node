import type { Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UsuarioConsultaController from '../../../src/controllers/geral/usuario.consulta.controller';
import LoginAppController from '../../../src/controllers/expedicao/login.app.controller';
import VersaoAppController from '../../../src/controllers/expedicao/versaoapp.controller';
import UsuarioConsultaService from '../../../src/services/usuario.consulta.service';
import ConsultaLoginAppService from '../../../src/services/consulta.login.app.service';
import ConsultaVersaoAppService from '../../../src/services/consulta.versaoapp.service';

afterEach(() => vi.restoreAllMocks());

const controllers = [
  { name: 'usuarios', handler: UsuarioConsultaController.get, service: UsuarioConsultaService.prototype },
  { name: 'login-app', handler: LoginAppController.get, service: ConsultaLoginAppService.prototype },
  { name: 'versaoapp', handler: VersaoAppController.get, service: ConsultaVersaoAppService.prototype },
];

describe.each(controllers)('$name pagination compatibility', ({ handler, service }) => {
  it.each([
    { Page: 3, Offset: undefined, Limit: 50, expectedPage: 3, expectedOffset: 100 },
    { Page: 9, Offset: 0, Limit: 50, expectedPage: 1, expectedOffset: 0 },
    { Page: 9, Offset: 50, Limit: 50, expectedPage: 2, expectedOffset: 50 },
    { Page: 9, Offset: 75, Limit: 50, expectedPage: 2, expectedOffset: 50 },
    { Page: 2, Offset: undefined, Limit: 5000, expectedPage: 2, expectedOffset: 5000 },
  ])('preserves Page=$Page Offset=$Offset Limit=$Limit', async (input) => {
    const result = {
      data: [], total: 0, totalPages: 0,
      page: input.expectedPage, limit: input.Limit, offset: input.expectedOffset,
    };
    const query = vi.spyOn(service, 'consultarTodos').mockResolvedValue(result);
    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const next = vi.fn();

    await handler(
      { validatedQuery: { Page: input.Page, Offset: input.Offset, Limit: input.Limit } } as unknown as Request,
      { status } as unknown as Response,
      next,
    );

    expect(next).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledExactlyOnceWith(input.expectedPage, input.Limit);
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({ ...result, message: expect.any(String) });
  });
});
