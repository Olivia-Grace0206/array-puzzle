export const ASSIST_TYPES = [
  'USE_CHECK',
  'ORDER_CHECK',
  'NEXT_MOVE',
] as const

export type AssistType =
  (typeof ASSIST_TYPES)[number]

export type PuzzleAssistState = {
  readonly usedAssistTypes: readonly AssistType[]

  /**
   * NEXT MOVEを使用した瞬間に開示したCard ID。
   *
   * 盤面が進んだ後も別のカードへ変化させず、
   * 最初に開示した結果を維持する。
   */
  readonly nextMoveCardId?: string
}

/**
 * Puzzle IDごとにAssistの使用状態を保持する。
 *
 * RuntimeStateとは分離しているため、
 * Restartや問題切替では失われない。
 */
export type AssistHistory = Readonly<
  Record<string, PuzzleAssistState>
>