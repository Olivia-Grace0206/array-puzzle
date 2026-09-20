import type { AssistType } from '../domain/assist'

export function calculateStars(
  usedAssistTypes: readonly AssistType[],
  isCleared: boolean,
): number {
  if (!isCleared) {
    return 0
  }

  const assistCount = new Set(
    usedAssistTypes,
  ).size

  return Math.max(0, 3 - assistCount)
}