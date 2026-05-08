export default class ResponseInfoDTO {
  readonly info: string;
  readonly message: string;
  readonly statusCode: number;

  constructor(params: { info: string; message: string; statusCode: number }) {
    this.info = params.info;
    this.message = params.message;
    this.statusCode = params.statusCode;
  }
}
