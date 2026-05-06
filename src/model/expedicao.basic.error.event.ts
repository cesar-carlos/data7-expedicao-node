export default class ExpedicaoBasicErrorEvent {
  Session: string;
  ResponseIn: string;
  Error: string[];
  Code?: string;
  RequestId?: string;

  constructor(params: {
    Session: string;
    ResponseIn: string;
    Error: string | string[];
    Code?: string;
    RequestId?: string;
  }) {
    this.Session = params.Session;
    this.ResponseIn = params.ResponseIn;
    this.Error = Array.isArray(params.Error) ? params.Error : [params.Error];
    this.Code = params.Code;
    this.RequestId = params.RequestId;
  }

  public toJson(): { Session: string; ResponseIn: string; Error: string[]; Code?: string; RequestId?: string } {
    const payload: { Session: string; ResponseIn: string; Error: string[]; Code?: string; RequestId?: string } = {
      Session: this.Session,
      ResponseIn: this.ResponseIn,
      Error: this.Error,
    };

    if (this.Code) {
      payload.Code = this.Code;
    }

    if (this.RequestId) {
      payload.RequestId = this.RequestId;
    }

    return payload;
  }
}
