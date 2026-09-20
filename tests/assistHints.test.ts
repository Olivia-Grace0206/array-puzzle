import { describe, expect, it } from 'vitest'
import {
  getNextMoveHint,
  getUseCheckCards,
} from '../src/core/assist/assistHints'
import type { CommandCard } from '../src/domain/commandCard'
import type { PuzzleDefinition } from '../src/domain/puzzle'

const card1: CommandCard = {
  id: 'card-1',
  command: {
    type: 'SWAP',
    a: 0,
    b: 1,
  },
}

const card2: CommandCard = {
  id: 'card-2',
  command: {
    type: 'MOVE',
    a: 2,
    b: 1,
  },
}

const extraCard: CommandCard = {
  id: 'extra-card',
  command: {
    type: 'REVERSE',
    l: 0,
    r: 2,
  },
}

function createPuzzle(): PuzzleDefinition {
  return {
    id: 'TEST-ASSIST',
    start: ['A', 'B', 'C'],
    target: ['B', 'C', 'A'],
    hand: [
      card1,
      card2,
      extraCard,
    ],
    designSolution: [
      card1.command,
      card2.command,
    ],
    designSolutionCardIds: [
      card1.id,
      card2.id,
    ],
    designSteps: 2,
    assistConfig: {
      orderHint: {
        cardId: card2.id,
        step: 2,
      },
    },
  }
}

describe('getUseCheckCards', () => {
  it('Design Solutionで使わないカードをすべて返す', () => {
    const puzzle = createPuzzle()

    const result =
      getUseCheckCards(puzzle)

    expect(
      result.map((card) => card.id),
    ).toEqual(['extra-card'])
  })

  it('すべてDesign Solutionで使う場合は空配列を返す', () => {
    const puzzle = createPuzzle()

    puzzle.hand = [card1, card2]

    expect(
      getUseCheckCards(puzzle),
    ).toEqual([])
  })

  it('元のHANDを変更しない', () => {
    const puzzle = createPuzzle()
    const originalHand = [...puzzle.hand]

    getUseCheckCards(puzzle)

    expect(puzzle.hand).toEqual(
      originalHand,
    )
  })
})

describe('getNextMoveHint', () => {
  it('初手ではDesign Solutionの1枚目を返す', () => {
    const result = getNextMoveHint(
      createPuzzle(),
      [],
    )

    expect(result).toEqual({
      status: 'AVAILABLE',
      cardId: 'card-1',
    })
  })

  it('正しい1手目の後は2枚目を返す', () => {
    const result = getNextMoveHint(
      createPuzzle(),
      [card1],
    )

    expect(result).toEqual({
      status: 'AVAILABLE',
      cardId: 'card-2',
    })
  })

  it('間違ったカードを使った後は回答しない', () => {
    const result = getNextMoveHint(
      createPuzzle(),
      [card2],
    )

    expect(result).toEqual({
      status: 'UNAVAILABLE',
      reason: 'OFF_DESIGN_PATH',
    })
  })

  it('Extra Cardを使った後は回答しない', () => {
    const result = getNextMoveHint(
      createPuzzle(),
      [extraCard],
    )

    expect(result).toEqual({
      status: 'UNAVAILABLE',
      reason: 'OFF_DESIGN_PATH',
    })
  })

  it('正しい手の後にExtra Cardを使っても回答しない', () => {
    const result = getNextMoveHint(
      createPuzzle(),
      [card1, extraCard],
    )

    expect(result).toEqual({
      status: 'UNAVAILABLE',
      reason: 'OFF_DESIGN_PATH',
    })
  })

  it('Design Solutionを完了済みなら回答しない', () => {
    const result = getNextMoveHint(
      createPuzzle(),
      [card1, card2],
    )

    expect(result).toEqual({
      status: 'UNAVAILABLE',
      reason:
        'DESIGN_SOLUTION_COMPLETE',
    })
  })

  it('判定しても使用済みCard配列を変更しない', () => {
    const usedCards = [card1]

    getNextMoveHint(
      createPuzzle(),
      usedCards,
    )

    expect(usedCards).toEqual([card1])
  })
})