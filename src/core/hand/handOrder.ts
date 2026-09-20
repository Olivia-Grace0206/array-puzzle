import type { CommandCard } from '../../domain/commandCard'
import type { HandOrderHistory } from '../../domain/handOrder'
import type { PuzzleDefinition } from '../../domain/puzzle'

export type RandomSource = () => number

export function createHandOrderHistory(): HandOrderHistory {
  return {}
}

/**
 * 入力配列を変更せず、Fisher-Yates方式でShuffleする。
 */
export function shuffleArray<T>(
  items: readonly T[],
  random: RandomSource = Math.random,
): T[] {
  const result = [...items]

  for (
    let index = result.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      random() * (index + 1),
    )

    const temporary = result[index]

    result[index] = result[randomIndex]
    result[randomIndex] = temporary
  }

  return result
}

/**
 * 問題のHAND表示順が未作成の場合だけShuffleして保存する。
 *
 * すでに保存済みの場合は、同じ履歴オブジェクトを返す。
 */
export function ensurePuzzleHandOrder(
  history: HandOrderHistory,
  puzzle: PuzzleDefinition,
  random: RandomSource = Math.random,
): HandOrderHistory {
  if (history[puzzle.id]) {
    return history
  }

  const shuffledCardIds = shuffleArray(
    puzzle.hand,
    random,
  ).map((card) => card.id)

  return {
    ...history,
    [puzzle.id]: shuffledCardIds,
  }
}

/**
 * 保存されたCard ID列に従ってHANDを並べる。
 *
 * 問題定義に後から新しいカードが追加された場合は、
 * 保存順に存在しないカードを末尾へ追加する。
 */
export function getOrderedHand(
  history: HandOrderHistory,
  puzzle: PuzzleDefinition,
): CommandCard[] {
  const storedCardIds = history[puzzle.id]

  if (!storedCardIds) {
    return [...puzzle.hand]
  }

  const cardById = new Map(
    puzzle.hand.map(
      (card) => [card.id, card] as const,
    ),
  )

  const orderedCards = storedCardIds
    .map((cardId) => cardById.get(cardId))
    .filter(
      (card): card is CommandCard =>
        card !== undefined,
    )

  const storedCardIdSet = new Set(
    storedCardIds,
  )

  const newlyAddedCards = puzzle.hand.filter(
    (card) =>
      !storedCardIdSet.has(card.id),
  )

  return [
    ...orderedCards,
    ...newlyAddedCards,
  ]
}