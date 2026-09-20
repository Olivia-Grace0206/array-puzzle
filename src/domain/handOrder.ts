/**
 * Puzzle IDごとに、HANDの表示順をCard ID列で保持する。
 */
export type HandOrderHistory = Readonly<
  Record<string, readonly string[]>
>