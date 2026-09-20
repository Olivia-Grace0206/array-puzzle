import { describe, expect, it } from 'vitest'
import { calculateStars } from '../src/core/calculateStars'

describe('calculateStars', () => {
  it('未ClearならAssist数に関係なく0を返す', () => {
    expect(calculateStars([], false)).toBe(0)

    expect(
      calculateStars(
        [
          'USE_CHECK',
          'ORDER_CHECK',
          'NEXT_MOVE',
        ],
        false,
      ),
    ).toBe(0)
  })

  it('Assist未使用でClearすると3を返す', () => {
    expect(calculateStars([], true)).toBe(3)
  })

  it('Assistを1種類使用してClearすると2を返す', () => {
    expect(
      calculateStars(['USE_CHECK'], true),
    ).toBe(2)
  })

  it('Assistを2種類使用してClearすると1を返す', () => {
    expect(
      calculateStars(
        ['USE_CHECK', 'ORDER_CHECK'],
        true,
      ),
    ).toBe(1)
  })

  it('Assistを3種類使用してClearすると0を返す', () => {
    expect(
      calculateStars(
        [
          'USE_CHECK',
          'ORDER_CHECK',
          'NEXT_MOVE',
        ],
        true,
      ),
    ).toBe(0)
  })

  it('同じAssistが重複してもStarsを追加で減らさない', () => {
    expect(
      calculateStars(
        ['USE_CHECK', 'USE_CHECK'],
        true,
      ),
    ).toBe(2)

    expect(
      calculateStars(
        [
          'USE_CHECK',
          'ORDER_CHECK',
          'ORDER_CHECK',
        ],
        true,
      ),
    ).toBe(1)
  })
})