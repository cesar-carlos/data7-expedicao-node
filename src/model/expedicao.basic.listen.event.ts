export default class ExpedicaoBasicListenEvent {
  Data: Record<string, unknown>[];

  constructor(params: { Data: Record<string, unknown>[] }) {
    this.Data = params.Data;
  }

  public toJson(): { Data: Record<string, unknown>[] } {
    return { Data: this.Data };
  }
}
