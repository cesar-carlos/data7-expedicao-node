import { createNotImplementedHandler } from '../controller.helpers';

export default class WebhookRegisterController {
  public static get = createNotImplementedHandler('WebhookRegisterController', 'get');
  public static post = createNotImplementedHandler('WebhookRegisterController', 'post');
  public static put = createNotImplementedHandler('WebhookRegisterController', 'put');
  public static delete = createNotImplementedHandler('WebhookRegisterController', 'delete');
}
