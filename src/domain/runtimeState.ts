import type { CommandCard } from './commandCard'

export type RuntimeState = {
  readonly currentArray: readonly string[]
  readonly remainingCards: readonly CommandCard[]
  readonly usedCards: readonly CommandCard[]
  readonly moveCount: number
}