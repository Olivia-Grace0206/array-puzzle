export type PuzzleCompletionStatus =
  | 'UNPLAYED'
  | 'CLEARED'
  | 'SKIPPED'

export type PuzzleProgress = {
  readonly status: PuzzleCompletionStatus
  readonly bestStars?: number
}

/**
 * Puzzle IDごとの進行状態。
 */
export type ProgressHistory = Readonly<
  Record<string, PuzzleProgress>
>