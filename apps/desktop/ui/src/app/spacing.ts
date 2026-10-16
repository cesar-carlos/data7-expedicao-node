/** Escala única de espaçamento da interface, em pixels. */
export class Spacing {
  static readonly xs = 4;
  static readonly sm = 8;
  static readonly md = 16;
  static readonly lg = 24;

  static readonly page = Spacing.lg;
  static readonly inline = Spacing.sm;
  static readonly stack = Spacing.md;
  static readonly field = Spacing.md;
  static readonly logX = Spacing.sm;
  static readonly logY = Spacing.xs;
  static readonly logMin = 160;
  static readonly inputX = Spacing.md;
  static readonly inputHeight = Spacing.lg * 2;
  static readonly inputValueTop = Spacing.md;
  static readonly inputValueBottom = Spacing.sm;
  static readonly buttonX = Spacing.md;
  static readonly buttonY = Spacing.sm;

  static install(root: HTMLElement = document.documentElement): void {
    const vars: Record<string, number> = {
      '--space-page': Spacing.page,
      '--space-inline': Spacing.inline,
      '--space-stack': Spacing.stack,
      '--space-field': Spacing.field,
      '--space-log-x': Spacing.logX,
      '--space-log-y': Spacing.logY,
      '--space-log-min': Spacing.logMin,
      '--space-input-x': Spacing.inputX,
      '--space-input-height': Spacing.inputHeight,
      '--space-input-value-top': Spacing.inputValueTop,
      '--space-input-value-bottom': Spacing.inputValueBottom,
      '--space-button-x': Spacing.buttonX,
      '--space-button-y': Spacing.buttonY,
    };
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, `${value}px`);
    }
  }
}
