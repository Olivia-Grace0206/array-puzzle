import type { StructuralMetrics } from '../../domain/puzzleQuality'

function ratio(value: number, maximum: number): number {
  return maximum <= 0 ? 1 : value / maximum
}

export function countPositionMatches(
  current: readonly string[],
  target: readonly string[],
): number {
  const length = Math.min(current.length, target.length)
  let matches = 0

  for (let index = 0; index < length; index += 1) {
    if (current[index] === target[index]) {
      matches += 1
    }
  }

  return matches
}

export function countTargetAdjacentPairs(
  current: readonly string[],
  target: readonly string[],
): number {
  const targetPairs = new Set<string>()

  for (let index = 0; index < target.length - 1; index += 1) {
    targetPairs.add(JSON.stringify([target[index], target[index + 1]]))
  }

  let pairs = 0
  for (let index = 0; index < current.length - 1; index += 1) {
    if (targetPairs.has(JSON.stringify([current[index], current[index + 1]]))) {
      pairs += 1
    }
  }

  return pairs
}

export function getLcsLength(
  current: readonly string[],
  target: readonly string[],
): number {
  const table = Array.from({ length: current.length + 1 }, () =>
    Array<number>(target.length + 1).fill(0),
  )

  for (let currentIndex = 1; currentIndex <= current.length; currentIndex += 1) {
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      table[currentIndex][targetIndex] =
        current[currentIndex - 1] === target[targetIndex - 1]
          ? table[currentIndex - 1][targetIndex - 1] + 1
          : Math.max(
              table[currentIndex - 1][targetIndex],
              table[currentIndex][targetIndex - 1],
            )
    }
  }

  return table[current.length][target.length]
}

export function getLongestTargetBlock(
  current: readonly string[],
  target: readonly string[],
): number {
  let longest = 0

  for (let currentStart = 0; currentStart < current.length; currentStart += 1) {
    for (let targetStart = 0; targetStart < target.length; targetStart += 1) {
      let blockLength = 0

      while (
        currentStart + blockLength < current.length &&
        targetStart + blockLength < target.length &&
        current[currentStart + blockLength] === target[targetStart + blockLength]
      ) {
        blockLength += 1
      }

      longest = Math.max(longest, blockLength)
    }
  }

  return longest
}

export function calculateStructuralMetrics(
  current: readonly string[],
  target: readonly string[],
): StructuralMetrics {
  const comparedLength = Math.max(current.length, target.length)
  const positionMatches = countPositionMatches(current, target)
  const targetAdjacentPairs = countTargetAdjacentPairs(current, target)
  const lcsLength = getLcsLength(current, target)
  const longestTargetBlock = getLongestTargetBlock(current, target)

  const weightedScore =
    ratio(positionMatches, comparedLength) * 0.35 +
    ratio(targetAdjacentPairs, Math.max(0, target.length - 1)) * 0.3 +
    ratio(lcsLength, comparedLength) * 0.2 +
    ratio(longestTargetBlock, comparedLength) * 0.15

  return {
    positionMatches,
    targetAdjacentPairs,
    lcsLength,
    longestTargetBlock,
    score: Math.round(weightedScore * 100),
  }
}
