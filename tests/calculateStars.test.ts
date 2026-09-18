import { describe, expect, it } from 'vitest'
import { calculateStars } from '../src/core/calculateStars'

describe('calculateStars', () => {
  it('returns 0 when puzzle is not cleared', () => {
    expect(calculateStars(1, 1, false)).toBe(0)
  })

  it('returns 3 when moveCount is equal to designSteps', () => {
    expect(calculateStars(2, 2, true)).toBe(3)
  })

  it('returns 3 when moveCount is less than designSteps', () => {
    expect(calculateStars(1, 2, true)).toBe(3)
  })

  it('returns 2 when moveCount is designSteps + 1', () => {
    expect(calculateStars(3, 2, true)).toBe(2)
  })

  it('returns 2 when moveCount is designSteps + 2', () => {
    expect(calculateStars(4, 2, true)).toBe(2)
  })

  it('returns 1 when moveCount is designSteps + 3 or more', () => {
    expect(calculateStars(5, 2, true)).toBe(1)
    expect(calculateStars(8, 2, true)).toBe(1)
  })
})