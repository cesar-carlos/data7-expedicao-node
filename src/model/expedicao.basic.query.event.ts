export default class ExpedicaoBasicSelectEvent {
  Session: string;
  ResponseIn: string;
  Data: unknown;

  constructor(params: { Session: string; ResponseIn: string; Data: unknown }) {
    this.Session = params.Session;
    this.ResponseIn = params.ResponseIn;
    this.Data = params.Data;
  }

  public toJson(): { Session: string; ResponseIn: string; Data: unknown } {
    return {
      Session: this.Session,
      ResponseIn: this.ResponseIn,
      Data: this.Data,
    };
  }
}
