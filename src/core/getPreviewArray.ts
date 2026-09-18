import type { RuntimeState } from '../domain/runtimeState'
import { applyCommand } from './commands/applyCommand'

export function getPreviewArray(
  state: RuntimeState,
  cardId: string,
): string[] {
  const card = state.remainingCards.find(
    (candidate) => candidate.id === cardId,
  )

  if (!card) {
    return [...state.currentArray]
  }

  return applyCommand(state.currentArray, card.command)
}