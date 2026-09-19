import { describe, expect, it } from 'vitest'
import {
  validatePuzzleDefinition,
  type PuzzleValidationIssueCode,
} from '../src/core/validation/validatePuzzleDefinition'
import type { PuzzleDefinition } from '../src/domain/puzzle'

function createValidPuzzle(
  overrides: Partial<PuzzleDefinition> = {},
): PuzzleDefinition {
  return {
    id: 'TEST-1',
    start: ['A', 'B', 'C'],
    target: ['C', 'B', 'A'],
    hand: [
      {
        id: 'card-1',
        command: {
          type: 'SWAP',
          a: 0,
          b: 2,
        },
      },
      {
        id: 'extra-card',
        command: {
          type: 'MOVE',
          a: 0,
          b: 1,
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
    designSolutionCardIds: ['card-1'],
    designSteps: 1,
    ...overrides,
  }
}

function getIssueCodes(
  puzzle: PuzzleDefinition,
): PuzzleValidationIssueCode[] {
  return validatePuzzleDefinition(puzzle).issues.map(
    (issue) => issue.code,
  )
}

describe('validatePuzzleDefinition', () => {
  it('有効な問題を受け入れる', () => {
    const result = validatePuzzleDefinition(
      createValidPuzzle(),
    )

    expect(result).toEqual({
      isValid: true,
      issues: [],
    })
  })

  it('Puzzle IDが空なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        id: '   ',
      }),
    )

    expect(codes).toContain('EMPTY_PUZZLE_ID')
  })

  it('STARTが空なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        start: [],
        target: [],
        hand: [],
        designSolution: [],
        designSolutionCardIds: [],
        designSteps: 0,
      }),
    )

    expect(codes).toContain('EMPTY_START')
  })

  it('STARTとTARGETの長さが違えば無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        target: ['C', 'B'],
      }),
    )

    expect(codes).toContain(
      'ARRAY_LENGTH_MISMATCH',
    )
  })

  it('STARTとTARGETの要素構成が違えば無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        target: ['C', 'B', 'D'],
      }),
    )

    expect(codes).toContain(
      'ARRAY_VALUES_MISMATCH',
    )
  })

  it('STARTとTARGETが同一なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        target: ['A', 'B', 'C'],
      }),
    )

    expect(codes).toContain('START_EQUALS_TARGET')
  })

  it('HANDが空なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        hand: [],
      }),
    )

    expect(codes).toContain('EMPTY_HAND')
  })

  it('HAND内のCard IDが重複していれば無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        hand: [
          {
            id: 'card-1',
            command: {
              type: 'SWAP',
              a: 0,
              b: 2,
            },
          },
          {
            id: 'card-1',
            command: {
              type: 'MOVE',
              a: 0,
              b: 1,
            },
          },
        ],
      }),
    )

    expect(codes).toContain(
      'DUPLICATE_HAND_CARD_ID',
    )
  })

  it('HANDのCommandが範囲外なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        hand: [
          {
            id: 'card-1',
            command: {
              type: 'SWAP',
              a: 0,
              b: 3,
            },
          },
        ],
      }),
    )

    expect(codes).toContain(
      'HAND_COMMAND_OUT_OF_RANGE',
    )
  })

  it('Design Solutionが空なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        designSolution: [],
        designSolutionCardIds: [],
        designSteps: 0,
      }),
    )

    expect(codes).toContain(
      'EMPTY_DESIGN_SOLUTION',
    )
  })

  it('designStepsがDesign Solutionの長さと違えば無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        designSteps: 2,
      }),
    )

    expect(codes).toContain(
      'DESIGN_STEPS_MISMATCH',
    )
  })

  it('Design Solution Card ID列の長さが違えば無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        designSolutionCardIds: [],
      }),
    )

    expect(codes).toContain(
      'DESIGN_CARD_IDS_LENGTH_MISMATCH',
    )
  })

  it('Design Solutionで同じCard IDを再使用したら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        target: ['B', 'A', 'C'],
        designSolution: [
          {
            type: 'SWAP',
            a: 0,
            b: 2,
          },
          {
            type: 'SWAP',
            a: 1,
            b: 2,
          },
        ],
        designSolutionCardIds: [
          'card-1',
          'card-1',
        ],
        designSteps: 2,
      }),
    )

    expect(codes).toContain(
      'DUPLICATE_DESIGN_CARD_ID',
    )
  })

  it('Design SolutionのCard IDがHANDになければ無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        designSolutionCardIds: ['unknown-card'],
      }),
    )

    expect(codes).toContain(
      'DESIGN_CARD_NOT_FOUND',
    )
  })

  it('Card IDが指すCommandとDesign Solutionが違えば無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        designSolution: [
          {
            type: 'MOVE',
            a: 0,
            b: 2,
          },
        ],
      }),
    )

    expect(codes).toContain(
      'DESIGN_COMMAND_MISMATCH',
    )
  })

  it('Design SolutionのCommandが範囲外なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        designSolution: [
          {
            type: 'SWAP',
            a: 0,
            b: 3,
          },
        ],
      }),
    )

    expect(codes).toContain(
      'DESIGN_COMMAND_OUT_OF_RANGE',
    )
  })

  it('Design SolutionでTARGETに到達しなければ無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        target: ['B', 'A', 'C'],
      }),
    )

    expect(codes).toContain('TARGET_NOT_REACHED')
  })

  it('ORDER CHECKのStepが2未満なら無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        assistConfig: {
          orderHint: {
            cardId: 'card-1',
            step: 1,
          },
        },
      }),
    )

    expect(codes).toContain(
      'ORDER_HINT_STEP_INVALID',
    )
  })

  it('ORDER CHECKのCard IDがHANDになければ無効にする', () => {
    const codes = getIssueCodes(
      createValidPuzzle({
        assistConfig: {
          orderHint: {
            cardId: 'unknown-card',
            step: 2,
          },
        },
      }),
    )

    expect(codes).toContain(
      'ORDER_HINT_CARD_NOT_FOUND',
    )
  })

  it('ORDER CHECKのCard IDが指定Stepと違えば無効にする', () => {
    const puzzle: PuzzleDefinition = {
      id: 'TEST-ORDER',
      start: ['A', 'B', 'C', 'D'],
      target: ['B', 'A', 'D', 'C'],
      hand: [
        {
          id: 'card-1',
          command: {
            type: 'SWAP',
            a: 0,
            b: 1,
          },
        },
        {
          id: 'card-2',
          command: {
            type: 'SWAP',
            a: 2,
            b: 3,
          },
        },
      ],
      designSolution: [
        {
          type: 'SWAP',
          a: 0,
          b: 1,
        },
        {
          type: 'SWAP',
          a: 2,
          b: 3,
        },
      ],
      designSolutionCardIds: [
        'card-1',
        'card-2',
      ],
      designSteps: 2,
      assistConfig: {
        orderHint: {
          cardId: 'card-1',
          step: 2,
        },
      },
    }

    const codes = getIssueCodes(puzzle)

    expect(codes).toContain(
      'ORDER_HINT_CARD_MISMATCH',
    )
  })
})