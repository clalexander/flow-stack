export function warning(condition: unknown, message: string): void {
  if (!condition && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn(message);
  }
}
