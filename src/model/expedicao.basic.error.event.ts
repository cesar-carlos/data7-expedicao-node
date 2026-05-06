export default class ExpedicaoBasicErrorEvent {
  Session: string;
  ResponseIn: string;
  Error: string[];

  constructor(params: { Session: string; ResponseIn: string; Error: string | string[] }) {
    this.Session = params.Session;
    this.ResponseIn = params.ResponseIn;
    this.Error = Array.isArray(params.Error) ? params.Error : [params.Error];
  }

  public toJson(): { Session: string; ResponseIn: string; Error: string[] } {
    return {
      Session: this.Session,
      ResponseIn: this.ResponseIn,
      Error: this.Error,
    };
  }
}
