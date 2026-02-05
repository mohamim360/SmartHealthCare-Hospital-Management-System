
export function catchAsync<T extends (...args: Array<any>) => Promise<any>>(
  fn: T,
): T {
  return (async (...args: Parameters<T>) => fn(...args)) as T;
}
