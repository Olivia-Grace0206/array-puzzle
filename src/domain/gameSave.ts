import type { AssistHistory } from './assist'
import type { HandOrderHistory } from './handOrder'
import type { ProgressHistory } from './progress'

export type GameSaveData = {
  readonly version: 1
  readonly assistHistory: AssistHistory
  readonly handOrderHistory: HandOrderHistory
  readonly progressHistory: ProgressHistory
}