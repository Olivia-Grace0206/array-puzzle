import { describe, expect, it } from 'vitest'
import { swap } from '../src/core/commands/swap'

describe('swap', () => {
  it('指定した2つのIndexの要素を交換する', () => {
    const result = swap(['A', 'B', 'C', 'D'], 1, 3)

    expect(result).toEqual(['A', 'D', 'C', 'B'])
  })

  it('先頭と末尾を交換できる', () => {
    const result = swap(['A', 'B', 'C', 'D'], 0, 3)

    expect(result).toEqual(['D', 'B', 'C', 'A'])
  })

  it('同じIndexを指定した場合は内容が変わらない', () => {
    const result = swap(['A', 'B', 'C'], 1, 1)

    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('入力配列を変更しない', () => {
    const original = ['A', 'B', 'C', 'D']

    const result = swap(original, 0, 3)

    expect(original).toEqual(['A', 'B', 'C', 'D'])
    expect(result).toEqual(['D', 'B', 'C', 'A'])
  })

  it('入力配列とは別の新しい配列を返す', () => {
    const original = ['A', 'B', 'C']

    const result = swap(original, 0, 2)

    expect(result).not.toBe(original)
  })
})