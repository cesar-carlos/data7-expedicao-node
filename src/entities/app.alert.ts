export default class AppAlert extends Error {
  constructor(
    readonly alert: string,
    message: string,
    readonly details: string,
  ) {
    super(message);
  }
}
