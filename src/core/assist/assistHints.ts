import type { CommandCard } from '../../domain/commandCard'
import type { PuzzleDefinition } from '../../domain/puzzle'

export type NextMoveUnavailableReason =
  | 'OFF_DESIGN_PATH'
  | 'DESIGN_SOLUTION_COMPLETE'

export type NextMoveHintResult =
  | {
      status: 'AVAILABLE'
      cardId: string
    }
  | {
      status: 'UNAVAILABLE'
      reason: NextMoveUnavailableReason
    }

/**
 * Design Solutionで使用しないすべてのカードを返す。
 */
export function getUseCheckCards(
  puzzle: PuzzleDefinition,
): CommandCard[] {
  const designCardIds = new Set(
    puzzle.designSolutionCardIds,
  )

  return puzzle.hand.filter(
    (card) => !designCardIds.has(card.id),
  )
}

/**
 * 現在までに使用したCard ID列が
 * Design Solution Card ID列の完全なPrefixなら、
 * 次に使用するCard IDを返す。
 */
export function getNextMoveHint(
  puzzle: PuzzleDefinition,
  usedCards: readonly CommandCard[],
): NextMoveHintResult {
  const usedCardIds = usedCards.map(
    (card) => card.id,
  )

  const isOnDesignPath = usedCardIds.every(
    (cardId, index) =>
      cardId ===
      puzzle.designSolutionCardIds[index],
  )

  if (!isOnDesignPath) {
    return {
      status: 'UNAVAILABLE',
      reason: 'OFF_DESIGN_PATH',
    }
  }

  if (
    usedCardIds.length >=
    puzzle.designSolutionCardIds.length
  ) {
    return {
      status: 'UNAVAILABLE',
      reason: 'DESIGN_SOLUTION_COMPLETE',
    }
  }

  return {
    status: 'AVAILABLE',
    cardId:
      puzzle.designSolutionCardIds[
        usedCardIds.length
      ],
  }
}