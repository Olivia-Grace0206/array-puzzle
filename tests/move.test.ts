import { describe, expect, it } from 'vitest'
import { move } from '../src/core/commands/move'

describe('move', () => {
  it('後ろの要素を前へ移動できる', () => {
    const result = move(['A', 'B', 'C', 'D', 'E'], 3, 1)

    expect(result).toEqual(['A', 'D', 'B', 'C', 'E'])
  })

  it('前の要素を後ろへ移動できる', () => {
    const result = move(['A', 'B', 'C', 'D', 'E'], 1, 3)

    expect(result).toEqual(['A', 'C', 'D', 'B', 'E'])
  })

  it('末尾の要素を先頭へ移動できる', () => {
    const result = move(['A', 'B', 'C', 'D'], 3, 0)

    expect(result).toEqual(['D', 'A', 'B', 'C'])
  })

  it('先頭の要素を末尾へ移動できる', () => {
    const result = move(['A', 'B', 'C', 'D'], 0, 3)

    expect(result).toEqual(['B', 'C', 'D', 'A'])
  })

  it('同じIndexを指定した場合は内容が変わらない', () => {
    const result = move(['A', 'B', 'C'], 1, 1)

    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('入力配列を変更しない', () => {
    const original = ['A', 'B', 'C', 'D']

    const result = move(original, 3, 1)

    expect(original).toEqual(['A', 'B', 'C', 'D'])
    expect(result).toEqual(['A', 'D', 'B', 'C'])
  })

  it('入力配列とは別の新しい配列を返す', () => {
    const original = ['A', 'B', 'C']

    const result = move(original, 0, 2)

    expect(result).not.toBe(original)
  })
})