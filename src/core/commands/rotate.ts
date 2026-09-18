export function rotate<T>(
  array: readonly T[],
  l: number,
  r: number,
  k: number,
): T[] {
  const result = [...array]
  const section = result.slice(l, r + 1)
  const length = section.length

  if (length <= 1) {
    return result
  }

  const normalizedK = ((k % length) + length) % length

  if (normalizedK === 0) {
    return result
  }

  const rotatedSection = [
    ...section.slice(length - normalizedK),
    ...section.slice(0, length - normalizedK),
  ]

  result.splice(l, length, ...rotatedSection)

  return result
}