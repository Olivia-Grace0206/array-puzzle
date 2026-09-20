import { describe, expect, it } from 'vitest'
import {
  calculateStructuralMetrics,
  countPositionMatches,
  countTargetAdjacentPairs,
  getLcsLength,
  getLongestTargetBlock,
} from '../src/core/quality/structuralMetrics'

describe('structuralMetrics', () => {
  const target = ['A', 'B', 'C', 'D']

  it('TARGETと同じ配列は全指標が最大になる', () => {
    expect(calculateStructuralMetrics(target, target)).toEqual({
      positionMatches: 4,
      targetAdjacentPairs: 3,
      lcsLength: 4,
      longestTargetBlock: 4,
      score: 100,
    })
  })

  it('Position Matchだけでは測れない構造を個別に数える', () => {
    const current = ['A', 'C', 'B', 'D']

    expect(countPositionMatches(current, target)).toBe(2)
    expect(countTargetAdjacentPairs(current, target)).toBe(0)
    expect(getLcsLength(current, target)).toBe(3)
    expect(getLongestTargetBlock(current, target)).toBe(1)
  })

  it('TARGET中の連続ブロックが別の位置にあっても検出する', () => {
    const current = ['C', 'D', 'A', 'B']

    expect(countTargetAdjacentPairs(current, target)).toBe(2)
    expect(getLongestTargetBlock(current, target)).toBe(2)
  })
})
