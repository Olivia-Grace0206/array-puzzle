export function swap<T>(
  array: readonly T[],
  a: number,
  b: number,
): T[] {
  const result = [...array]

  const temp = result[a]
  result[a] = result[b]
  result[b] = temp

  return result
}