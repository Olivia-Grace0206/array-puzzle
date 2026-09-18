import { describe, expect, it } from 'vitest'
import { applyCommand } from '../src/core/commands/applyCommand'

describe('applyCommand', () => {
  it('SWAPを実行できる', () => {
    const result = applyCommand(
      ['A', 'B', 'C', 'D'],
      {
        type: 'SWAP',
        a: 1,
        b: 3,
      },
    )

    expect(result).toEqual(['A', 'D', 'C', 'B'])
  })

  it('REVERSEを実行できる', () => {
    const result = applyCommand(
      ['A', 'B', 'C', 'D'],
      {
        type: 'REVERSE',
        l: 1,
        r: 3,
      },
    )

    expect(result).toEqual(['A', 'D', 'C', 'B'])
  })

  it('ROTATEを実行できる', () => {
    const result = applyCommand(
      ['A', 'B', 'C', 'D'],
      {
        type: 'ROTATE',
        l: 1,
        r: 3,
        k: 1,
      },
    )

    expect(result).toEqual(['A', 'D', 'B', 'C'])
  })

  it('MOVEを実行できる', () => {
    const result = applyCommand(
      ['A', 'B', 'C', 'D'],
      {
        type: 'MOVE',
        a: 3,
        b: 1,
      },
    )

    expect(result).toEqual(['A', 'D', 'B', 'C'])
  })

  it('入力配列を変更しない', () => {
    const original = ['A', 'B', 'C', 'D']

    applyCommand(original, {
      type: 'SWAP',
      a: 0,
      b: 3,
    })

    expect(original).toEqual(['A', 'B', 'C', 'D'])
  })
})