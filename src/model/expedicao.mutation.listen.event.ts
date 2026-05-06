export default class ExpedicaoMutationListenEvent {
  Mutation: unknown[];

  constructor(params: { Mutation: unknown[] }) {
    this.Mutation = params.Mutation;
  }

  public toJson(): { Mutation: unknown[] } {
    return { Mutation: this.Mutation };
  }
}
