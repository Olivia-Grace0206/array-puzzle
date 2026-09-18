import type { Command } from './command'
import type { CommandCard } from './commandCard'

export type OrderHintConfig = {
  cardId: string
  step: number
}

export type AssistConfig = {
  orderHint?: OrderHintConfig
}

export type PuzzleDefinition = {
  id: string
  start: string[]
  target: string[]
  hand: CommandCard[]
  designSolution: Command[]
  designSteps: number
  assistConfig?: AssistConfig
}