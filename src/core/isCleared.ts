export function isCleared<T>(
  current: readonly T[],
  target: readonly T[],
): boolean {
  if (current.length !== target.length) {
    return false
  }

  return current.every((value, index) => value === target[index])
}