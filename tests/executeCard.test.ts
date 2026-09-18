import { describe, expect, it } from 'vitest'
import { executeCard } from '../src/core/executeCard'
import type { RuntimeState } from '../src/domain/runtimeState'

function createState(): RuntimeState {
  return {
    currentArray: ['A', 'B', 'C', 'D'],
    remainingCards: [
      {
        id: 'card-1',
        command: {
          type: 'SWAP',
          a: 1,
          b: 3,
        },
      },
      {
        id: 'card-2',
        command: {
          type: 'MOVE',
          a: 0,
          b: 2,
        },
      },
    ],
    usedCards: [],
    moveCount: 0,
  }
}

describe('executeCard', () => {
  it('指定したカードのCommandをCURRENTへ適用する', () => {
    const state = createState()

    const result = executeCard(state, 'card-1')

    expect(result.currentArray).toEqual(['A', 'D', 'C', 'B'])
  })

  it('使用したカードをremainingCardsから取り除く', () => {
    const state = createState()

    const result = executeCard(state, 'card-1')

    expect(result.remainingCards.map((card) => card.id)).toEqual([
      'card-2',
    ])
  })

  it('使用したカードをusedCardsへ移す', () => {
    const state = createState()

    const result = executeCard(state, 'card-1')

    expect(result.usedCards.map((card) => card.id)).toEqual([
      'card-1',
    ])
  })

  it('カードを実行するとmoveCountが1増える', () => {
    const state = createState()

    const result = executeCard(state, 'card-1')

    expect(result.moveCount).toBe(1)
  })

  it('使用済みカードは再利用できない', () => {
    const state = createState()

    const afterFirstExecute = executeCard(state, 'card-1')
    const afterSecondExecute = executeCard(
      afterFirstExecute,
      'card-1',
    )

    expect(afterSecondExecute.currentArray).toEqual([
      'A',
      'D',
      'C',
      'B',
    ])
    expect(afterSecondExecute.usedCards).toHaveLength(1)
    expect(afterSecondExecute.moveCount).toBe(1)
  })

  it('元のRuntimeStateを変更しない', () => {
    const state = createState()

    executeCard(state, 'card-1')

    expect(state.currentArray).toEqual(['A', 'B', 'C', 'D'])
    expect(state.remainingCards.map((card) => card.id)).toEqual([
      'card-1',
      'card-2',
    ])
    expect(state.usedCards).toEqual([])
    expect(state.moveCount).toBe(0)
  })

  it('存在しないカードIDでは状態を変更しない', () => {
    const state = createState()

    const result = executeCard(state, 'unknown-card')

    expect(result).toBe(state)
  })
})