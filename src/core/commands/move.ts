export function move<T>(
  array: readonly T[],
  a: number,
  b: number,
): T[] {
  const result = [...array]

  const [item] = result.splice(a, 1)
  result.splice(b, 0, item)

  return result
}