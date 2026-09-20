import type { PuzzleDefinition } from '../../domain/puzzle'
import type {
  ProgressHistory,
  PuzzleProgress,
} from '../../domain/progress'

const UNPLAYED_PROGRESS: PuzzleProgress = {
  status: 'UNPLAYED',
}

export function createProgressHistory(): ProgressHistory {
  return {}
}

export function getPuzzleProgress(
  history: ProgressHistory,
  puzzleId: string,
): PuzzleProgress {
  return (
    history[puzzleId] ??
    UNPLAYED_PROGRESS
  )
}

export function isPuzzleCompleted(
  history: ProgressHistory,
  puzzleId: string,
): boolean {
  return (
    getPuzzleProgress(history, puzzleId)
      .status !== 'UNPLAYED'
  )
}

/**
 * Clearを記録する。
 *
 * 再挑戦時に以前より低いStarsだった場合も、
 * bestStarsは以前の最高値を維持する。
 */
export function recordPuzzleCleared(
  history: ProgressHistory,
  puzzleId: string,
  stars: number,
): ProgressHistory {
  const currentProgress =
    getPuzzleProgress(history, puzzleId)

  const bestStars = Math.max(
    currentProgress.bestStars ?? 0,
    stars,
  )

  if (
    currentProgress.status === 'CLEARED' &&
    currentProgress.bestStars === bestStars
  ) {
    return history
  }

  return {
    ...history,
    [puzzleId]: {
      status: 'CLEARED',
      bestStars,
    },
  }
}

/**
 * Skipを記録する。
 *
 * Clear済みの問題をSkipしても、
 * CLEAREDをSKIPPEDへ戻さない。
 */
export function recordPuzzleSkipped(
  history: ProgressHistory,
  puzzleId: string,
): ProgressHistory {
  const currentProgress =
    getPuzzleProgress(history, puzzleId)

  if (
    currentProgress.status === 'CLEARED' ||
    currentProgress.status === 'SKIPPED'
  ) {
    return history
  }

  return {
    ...history,
    [puzzleId]: {
      status: 'SKIPPED',
    },
  }
}

/**
 * 最初の問題は常に解放する。
 *
 * 2問目以降は、直前の問題がClearまたはSkipされていれば
 * 解放する。
 */
export function isPuzzleUnlocked(
  puzzles: readonly PuzzleDefinition[],
  puzzleIndex: number,
  history: ProgressHistory,
): boolean {
  if (
    puzzleIndex < 0 ||
    puzzleIndex >= puzzles.length
  ) {
    return false
  }

  if (puzzleIndex === 0) {
    return true
  }

  const previousPuzzle =
    puzzles[puzzleIndex - 1]

  return isPuzzleCompleted(
    history,
    previousPuzzle.id,
  )
}