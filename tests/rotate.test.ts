import { describe, expect, it } from 'vitest'
import { rotate } from '../src/core/commands/rotate'

describe('rotate', () => {
  it('指定範囲を右へ1回転する', () => {
    const result = rotate(['A', 'B', 'C', 'D', 'E'], 1, 3, 1)

    expect(result).toEqual(['A', 'D', 'B', 'C', 'E'])
  })

  it('指定範囲を左へ1回転する', () => {
    const result = rotate(['A', 'B', 'C', 'D', 'E'], 1, 3, -1)

    expect(result).toEqual(['A', 'C', 'D', 'B', 'E'])
  })

  it('右へ2回転できる', () => {
    const result = rotate(['A', 'B', 'C', 'D', 'E'], 1, 4, 2)

    expect(result).toEqual(['A', 'D', 'E', 'B', 'C'])
  })

  it('左へ2回転できる', () => {
    const result = rotate(['A', 'B', 'C', 'D', 'E'], 1, 4, -2)

    expect(result).toEqual(['A', 'D', 'E', 'B', 'C'])
  })

  it('範囲の長さを超える回転量を処理できる', () => {
    const result = rotate(['A', 'B', 'C', 'D'], 1, 3, 4)

    expect(result).toEqual(['A', 'D', 'B', 'C'])
  })

  it('回転量が0なら内容が変わらない', () => {
    const result = rotate(['A', 'B', 'C'], 0, 2, 0)

    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('1要素だけの範囲では内容が変わらない', () => {
    const result = rotate(['A', 'B', 'C'], 1, 1, 1)

    expect(result).toEqual(['A', 'B', 'C'])
  })

  it('入力配列を変更しない', () => {
    const original = ['A', 'B', 'C', 'D']

    const result = rotate(original, 1, 3, 1)

    expect(original).toEqual(['A', 'B', 'C', 'D'])
    expect(result).toEqual(['A', 'D', 'B', 'C'])
  })

  it('入力配列とは別の新しい配列を返す', () => {
    const original = ['A', 'B', 'C']

    const result = rotate(original, 0, 2, 1)

    expect(result).not.toBe(original)
  })
})