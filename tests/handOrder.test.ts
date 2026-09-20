import { describe, expect, it } from 'vitest'
import {
  createHandOrderHistory,
  ensurePuzzleHandOrder,
  getOrderedHand,
  shuffleArray,
} from '../src/core/hand/handOrder'
import type { PuzzleDefinition } from '../src/domain/puzzle'

function createPuzzle(
  id = 'TEST-HAND',
): PuzzleDefinition {
  return {
    id,
    start: ['A', 'B', 'C'],
    target: ['C', 'B', 'A'],
    hand: [
      {
        id: `${id}-card-1`,
        command: {
          type: 'SWAP',
          a: 0,
          b: 2,
        },
      },
      {
        id: `${id}-card-2`,
        command: {
          type: 'MOVE',
          a: 0,
          b: 1,
        },
      },
      {
        id: `${id}-card-3`,
        command: {
          type: 'REVERSE',
          l: 0,
          r: 2,
        },
      },
    ],
    designSolution: [
      {
        type: 'SWAP',
        a: 0,
        b: 2,
      },
    ],
    designSolutionCardIds: [
      `${id}-card-1`,
    ],
    designSteps: 1,
  }
}

describe('shuffleArray', () => {
  it('入力配列を変更しない', () => {
    const original = ['A', 'B', 'C']

    const result = shuffleArray(
      original,
      () => 0,
    )

    expect(original).toEqual([
      'A',
      'B',
      'C',
    ])

    expect(result).not.toBe(original)
  })

  it('渡された乱数を使ってShuffleする', () => {
    const randomValues = [0.9, 0.1]
    let randomIndex = 0

    const result = shuffleArray(
      ['A', 'B', 'C'],
      () => {
        const value =
          randomValues[randomIndex]

        randomIndex += 1

        return value
      },
    )

    expect(result).toEqual([
      'B',
      'A',
      'C',
    ])
  })

  it('Shuffle後もすべての要素を保持する', () => {
    const result = shuffleArray(
      ['A', 'B', 'C', 'D'],
      () => 0.4,
    )

    expect([...result].sort()).toEqual([
      'A',
      'B',
      'C',
      'D',
    ])
  })
})

describe('handOrderHistory', () => {
  it('初回入場時にHAND表示順を保存する', () => {
    const puzzle = createPuzzle()

    const result = ensurePuzzleHandOrder(
      createHandOrderHistory(),
      puzzle,
      () => 0,
    )

    expect(result[puzzle.id]).toEqual([
      'TEST-HAND-card-2',
      'TEST-HAND-card-3',
      'TEST-HAND-card-1',
    ])
  })

  it('保存済み問題は再Shuffleしない', () => {
    const puzzle = createPuzzle()

    const history = ensurePuzzleHandOrder(
      createHandOrderHistory(),
      puzzle,
      () => 0,
    )

    let randomCallCount = 0

    const result = ensurePuzzleHandOrder(
      history,
      puzzle,
      () => {
        randomCallCount += 1
        return 0.9
      },
    )

    expect(result).toBe(history)
    expect(randomCallCount).toBe(0)
  })

  it('問題ごとに異なる表示順を保持する', () => {
    const firstPuzzle =
      createPuzzle('PUZZLE-1')

    const secondPuzzle =
      createPuzzle('PUZZLE-2')

    const firstHistory =
      ensurePuzzleHandOrder(
        createHandOrderHistory(),
        firstPuzzle,
        () => 0,
      )

    const result = ensurePuzzleHandOrder(
      firstHistory,
      secondPuzzle,
      () => 0.9,
    )

    expect(
      result[firstPuzzle.id],
    ).toBeDefined()

    expect(
      result[secondPuzzle.id],
    ).toBeDefined()
  })

  it('保存されたCard ID順にHANDを返す', () => {
    const puzzle = createPuzzle()

    const history = {
      [puzzle.id]: [
        'TEST-HAND-card-3',
        'TEST-HAND-card-1',
        'TEST-HAND-card-2',
      ],
    }

    const result = getOrderedHand(
      history,
      puzzle,
    )

    expect(
      result.map((card) => card.id),
    ).toEqual([
      'TEST-HAND-card-3',
      'TEST-HAND-card-1',
      'TEST-HAND-card-2',
    ])
  })

  it('後から追加されたカードを末尾へ追加する', () => {
    const puzzle = createPuzzle()

    const history = {
      [puzzle.id]: [
        'TEST-HAND-card-2',
        'TEST-HAND-card-1',
      ],
    }

    const result = getOrderedHand(
      history,
      puzzle,
    )

    expect(
      result.map((card) => card.id),
    ).toEqual([
      'TEST-HAND-card-2',
      'TEST-HAND-card-1',
      'TEST-HAND-card-3',
    ])
  })
})