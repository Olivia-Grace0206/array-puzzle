import { describe, expect, it } from 'vitest'
import {
  createProgressHistory,
  getPuzzleProgress,
  isPuzzleUnlocked,
  recordPuzzleCleared,
  recordPuzzleSkipped,
} from '../src/core/progress/progressHistory'
import type { PuzzleDefinition } from '../src/domain/puzzle'

function createPuzzle(
  id: string,
): PuzzleDefinition {
  return {
    id,
    start: ['A', 'B'],
    target: ['B', 'A'],
    hand: [
      {
        id: `${id}-card-1`,
        command: {
          type: 'SWAP',
          a: 0,
          b: 1,
        },
      },
    ],
    designSolution: [
      {
        type: 'SWAP',
        a: 0,
        b: 1,
      },
    ],
    designSolutionCardIds: [
      `${id}-card-1`,
    ],
    designSteps: 1,
  }
}

const puzzles = [
  createPuzzle('P-1'),
  createPuzzle('P-2'),
  createPuzzle('P-3'),
]

describe('progressHistory', () => {
  it('初期状態はUNPLAYEDになる', () => {
    const history =
      createProgressHistory()

    expect(
      getPuzzleProgress(history, 'P-1'),
    ).toEqual({
      status: 'UNPLAYED',
    })
  })

  it('Clearと獲得Starsを記録する', () => {
    const result =
      recordPuzzleCleared(
        createProgressHistory(),
        'P-1',
        2,
      )

    expect(
      getPuzzleProgress(result, 'P-1'),
    ).toEqual({
      status: 'CLEARED',
      bestStars: 2,
    })
  })

  it('再Clear時は最高Starsを維持する', () => {
    const firstClear =
      recordPuzzleCleared(
        createProgressHistory(),
        'P-1',
        3,
      )

    const result =
      recordPuzzleCleared(
        firstClear,
        'P-1',
        1,
      )

    expect(
      getPuzzleProgress(result, 'P-1'),
    ).toEqual({
      status: 'CLEARED',
      bestStars: 3,
    })
  })

  it('以前より高いStarsなら更新する', () => {
    const firstClear =
      recordPuzzleCleared(
        createProgressHistory(),
        'P-1',
        1,
      )

    const result =
      recordPuzzleCleared(
        firstClear,
        'P-1',
        3,
      )

    expect(
      getPuzzleProgress(result, 'P-1'),
    ).toEqual({
      status: 'CLEARED',
      bestStars: 3,
    })
  })

  it('Skipを記録する', () => {
    const result =
      recordPuzzleSkipped(
        createProgressHistory(),
        'P-1',
      )

    expect(
      getPuzzleProgress(result, 'P-1'),
    ).toEqual({
      status: 'SKIPPED',
    })
  })

  it('Clear済み問題をSkipへ戻さない', () => {
    const clearedHistory =
      recordPuzzleCleared(
        createProgressHistory(),
        'P-1',
        2,
      )

    const result =
      recordPuzzleSkipped(
        clearedHistory,
        'P-1',
      )

    expect(result).toBe(clearedHistory)

    expect(
      getPuzzleProgress(result, 'P-1'),
    ).toEqual({
      status: 'CLEARED',
      bestStars: 2,
    })
  })

  it('Skip後にClearするとCLEAREDへ更新する', () => {
    const skippedHistory =
      recordPuzzleSkipped(
        createProgressHistory(),
        'P-1',
      )

    const result =
      recordPuzzleCleared(
        skippedHistory,
        'P-1',
        2,
      )

    expect(
      getPuzzleProgress(result, 'P-1'),
    ).toEqual({
      status: 'CLEARED',
      bestStars: 2,
    })
  })

  it('最初の問題だけ最初から解放する', () => {
    const history =
      createProgressHistory()

    expect(
      isPuzzleUnlocked(
        puzzles,
        0,
        history,
      ),
    ).toBe(true)

    expect(
      isPuzzleUnlocked(
        puzzles,
        1,
        history,
      ),
    ).toBe(false)
  })

  it('直前の問題をClearすると次を解放する', () => {
    const history =
      recordPuzzleCleared(
        createProgressHistory(),
        'P-1',
        3,
      )

    expect(
      isPuzzleUnlocked(
        puzzles,
        1,
        history,
      ),
    ).toBe(true)

    expect(
      isPuzzleUnlocked(
        puzzles,
        2,
        history,
      ),
    ).toBe(false)
  })

  it('直前の問題をSkipしても次を解放する', () => {
    const history =
      recordPuzzleSkipped(
        createProgressHistory(),
        'P-1',
      )

    expect(
      isPuzzleUnlocked(
        puzzles,
        1,
        history,
      ),
    ).toBe(true)
  })

  it('範囲外の問題Indexは解放しない', () => {
    expect(
      isPuzzleUnlocked(
        puzzles,
        -1,
        createProgressHistory(),
      ),
    ).toBe(false)

    expect(
      isPuzzleUnlocked(
        puzzles,
        puzzles.length,
        createProgressHistory(),
      ),
    ).toBe(false)
  })
})