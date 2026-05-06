export default class ExpedicaoMutationBasicEvent {
  Session: string;
  ResponseIn: string;
  Mutation: unknown[];

  constructor(params: { Session: string; ResponseIn: string; Mutation: unknown[] }) {
    this.Session = params.Session;
    this.ResponseIn = params.ResponseIn;
    this.Mutation = params.Mutation;
  }

  public toJson(): { Session: string; ResponseIn: string; Mutation: unknown[] } {
    return {
      Session: this.Session,
      ResponseIn: this.ResponseIn,
      Mutation: this.Mutation,
    };
  }
}
