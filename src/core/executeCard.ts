import type { RuntimeState } from '../domain/runtimeState'
import { applyCommand } from './commands/applyCommand'

export function executeCard(
  state: RuntimeState,
  cardId: string,
): RuntimeState {
  const card = state.remainingCards.find(
    (candidate) => candidate.id === cardId,
  )

  if (!card) {
    return state
  }

  return {
    currentArray: applyCommand(state.currentArray, card.command),
    remainingCards: state.remainingCards.filter(
      (candidate) => candidate.id !== cardId,
    ),
    usedCards: [...state.usedCards, card],
    moveCount: state.moveCount + 1,
  }
}