export function reverse<T>(
  array: readonly T[],
  l: number,
  r: number,
): T[] {
  const result = [...array]

  const reversedSection = result.slice(l, r + 1).reverse()

  result.splice(l, r - l + 1, ...reversedSection)

  return result
}