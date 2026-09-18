import { describe, expect, it } from 'vitest'
import { isCleared } from '../src/core/isCleared'

describe('isCleared', () => {
  it('CURRENTとTARGETが完全一致ならtrueを返す', () => {
    const result = isCleared(
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
    )

    expect(result).toBe(true)
  })

  it('1要素でも異なればfalseを返す', () => {
    const result = isCleared(
      ['A', 'B', 'D', 'C'],
      ['A', 'B', 'C', 'D'],
    )

    expect(result).toBe(false)
  })

  it('要素が同じでも順番が異なればfalseを返す', () => {
    const result = isCleared(
      ['D', 'C', 'B', 'A'],
      ['A', 'B', 'C', 'D'],
    )

    expect(result).toBe(false)
  })

  it('配列の長さが異なればfalseを返す', () => {
    const result = isCleared(
      ['A', 'B', 'C'],
      ['A', 'B', 'C', 'D'],
    )

    expect(result).toBe(false)
  })

  it('空配列同士は一致としてtrueを返す', () => {
    const result = isCleared([], [])

    expect(result).toBe(true)
  })
})