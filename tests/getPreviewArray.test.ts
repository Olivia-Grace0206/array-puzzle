import { describe, expect, it } from 'vitest'
import { getPreviewArray } from '../src/core/getPreviewArray'
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
    ],
    usedCards: [],
    moveCount: 0,
  }
}

describe('getPreviewArray', () => {
  it('指定したカードを適用したPreview配列を返す', () => {
    const state = createState()

    const preview = getPreviewArray(state, 'card-1')

    expect(preview).toEqual(['A', 'D', 'C', 'B'])
  })

  it('PreviewしてもcurrentArrayを変更しない', () => {
    const state = createState()

    getPreviewArray(state, 'card-1')

    expect(state.currentArray).toEqual(['A', 'B', 'C', 'D'])
  })

  it('Previewしてもカードを消費しない', () => {
    const state = createState()

    getPreviewArray(state, 'card-1')

    expect(state.remainingCards).toHaveLength(1)
    expect(state.remainingCards[0].id).toBe('card-1')
    expect(state.usedCards).toEqual([])
  })

  it('PreviewしてもmoveCountを増やさない', () => {
    const state = createState()

    getPreviewArray(state, 'card-1')

    expect(state.moveCount).toBe(0)
  })

  it('存在しないカードIDではCURRENTと同じ内容を返す', () => {
    const state = createState()

    const preview = getPreviewArray(state, 'unknown-card')

    expect(preview).toEqual(['A', 'B', 'C', 'D'])
  })

  it('存在しないカードIDでもcurrentArrayとは別配列を返す', () => {
    const state = createState()

    const preview = getPreviewArray(state, 'unknown-card')

    expect(preview).not.toBe(state.currentArray)
  })
})