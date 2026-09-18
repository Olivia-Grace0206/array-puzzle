export function calculateStars(
  moveCount: number,
  designSteps: number,
  isCleared: boolean,
): number {
  if (!isCleared) {
    return 0
  }

  if (moveCount <= designSteps) {
    return 3
  }

  if (moveCount <= designSteps + 2) {
    return 2
  }

  return 1
}