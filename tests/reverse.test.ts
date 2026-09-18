import { describe, expect, it } from 'vitest'
import { reverse } from '../src/core/commands/reverse'

describe('reverse', () => {
  it('指定した範囲を反転する', () => {
    const result = reverse(['A', 'B', 'C', 'D', 'E'], 1, 3)

    expect(result).toEqual(['A', 'D', 'C', 'B', 'E'])
  })

  it('配列全体を反転できる', () => {
    const result = reverse(['A', 'B', 'C', 'D'], 0, 3)

    expect(result).toEqual(['D', 'C', 'B', 'A'])
  })

  it('先頭を含む範囲を反転できる', () => {
    const result = reverse(['A', 'B', 'C', 'D'], 0, 2)

    expect(result).toEqual(['C', 'B', 'A', 'D'])
  })

  it('末尾を含む範囲を反転できる', () => {
    const result = reverse(['A', 'B', 'C', 'D'], 1, 3)

    expect(result).toEqual(['A', 'D', 'C', 'B'])
  })

  it('同じIndexを指定した場合は内容が変わらない', () => {
    const result = reverse(['A', 'B', 'C'], 1, 1)

    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('入力配列を変更しない', () => {
    const original = ['A', 'B', 'C', 'D']

    const result = reverse(original, 1, 3)

    expect(original).toEqual(['A', 'B', 'C', 'D'])
    expect(result).toEqual(['A', 'D', 'C', 'B'])
  })

  it('入力配列とは別の新しい配列を返す', () => {
    const original = ['A', 'B', 'C']

    const result = reverse(original, 0, 2)

    expect(result).not.toBe(original)
  })
})