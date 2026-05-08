import { requestCreatePixDTO } from '../dto/api.requets/request.create.pix.dto';
import { responseCreatePixDto } from '../dto/api.responses/response.create.pix.dto';

export default interface CreatePixApiContract {
  execute(request: requestCreatePixDTO): Promise<responseCreatePixDto>;
}
