export const ASSIST_TYPES = [
  'USE_CHECK',
  'ORDER_CHECK',
  'NEXT_MOVE',
] as const

export type AssistType =
  (typeof ASSIST_TYPES)[number]

/**
 * Puzzle IDごとに、使用済みAssist種類を保持する。
 *
 * RuntimeStateとは分離しているため、
 * 盤面をRestartしてもAssist履歴は失われない。
 */
export type AssistHistory = Readonly<
  Record<string, readonly AssistType[]>
>