
export function catchAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      // Re-throw to be caught by error middleware
      throw error
    }
  }) as T
}
