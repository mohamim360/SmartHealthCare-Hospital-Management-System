export function catchAsync<
  T extends (...args: Array<any>) => Promise<any>
>(
  fn: T,
  onError?: (error: unknown) => ReturnType<T> | never,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (err) {
      if (typeof onError === 'function') {
        return onError(err)
      }
      throw err
    }
  }) as T
}
