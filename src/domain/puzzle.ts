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

  /**
   * Design Solutionで実行するCommand列。
   */
  designSolution: Command[]

  /**
   * designSolutionの各Commandに対応するCard ID列。
   *
   * 同じCommand内容のカードがHANDに複数存在しても、
   * 正解として使用するカードを一意に識別する。
   */
  designSolutionCardIds: string[]

  designSteps: number
  assistConfig?: AssistConfig
}