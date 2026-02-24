export type WithUndefined<T> = { [K in keyof T]?: T[K] | undefined };

export function compactUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
