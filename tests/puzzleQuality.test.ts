import { describe, expect, it } from 'vitest'
import { applyCommand } from '../src/core/commands/applyCommand'
import {
  GENERATOR_DIFFICULTIES,
  generatePuzzleWithReport,
} from '../src/core/generator/generatePuzzle'
import { analyzePuzzleQuality } from '../src/core/quality/analyzePuzzleQuality'
import type { PuzzleDefinition } from '../src/domain/puzzle'
import { PUZZLE_STYLE_TAGS } from '../src/domain/puzzleQuality'

describe('analyzePuzzleQuality', () => {
  it('自動生成問題はQuality Gateを通り、Design Solutionで解ける', () => {
    for (const difficulty of GENERATOR_DIFFICULTIES) {
      for (let seed = 1; seed <= 25; seed += 1) {
        const result = generatePuzzleWithReport({ difficulty, seed })
        const solved = result.puzzle.designSolution.reduce(
          (array, command) => applyCommand(array, command),
          result.puzzle.start,
        )

        expect(result.qualityReport.accepted).toBe(true)
        expect(result.qualityReport.rejectReasons).toEqual([])
        expect(result.qualityReport.qualityScores.overall).toBeGreaterThanOrEqual(50)
        expect(solved).toEqual(result.puzzle.target)
        expect(result.generationAttempts).toBeGreaterThan(0)
        expect(
          result.qualityReport.styleTags.every((tag) =>
            PUZZLE_STYLE_TAGS.includes(tag),
          ),
        ).toBe(true)
      }
    }
  })

  it('同じdifficultyとseedなら分析結果を含めて同一になる', () => {
    const first = generatePuzzleWithReport({
      difficulty: 'NORMAL',
      seed: 123456,
    })
    const second = generatePuzzleWithReport({
      difficulty: 'NORMAL',
      seed: 123456,
    })

    expect(second).toEqual(first)
  })

  it('STARTとTARGETが同じ候補をRejectする', () => {
    const puzzle: PuzzleDefinition = {
      id: 'QUALITY-REJECT-TEST',
      start: ['A', 'B', 'C'],
      target: ['A', 'B', 'C'],
      hand: [
        {
          id: 'card-1',
          command: { type: 'SWAP', a: 0, b: 1 },
        },
      ],
      designSolution: [{ type: 'SWAP', a: 0, b: 1 }],
      designSolutionCardIds: ['card-1'],
      designSteps: 1,
    }

    const report = analyzePuzzleQuality(puzzle)

    expect(report.accepted).toBe(false)
    expect(report.rejectReasons).toContain('START_EQUALS_TARGET')
    expect(report.rejectReasons).toContain('SINGLE_MOVE_NON_TUTORIAL')
  })

  it('Design Solutionが複数手でも1枚でClearできる候補をRejectする', () => {
    const puzzle: PuzzleDefinition = {
      id: 'ONE-MOVE-ALTERNATIVE-TEST',
      start: ['A', 'B', 'C', 'D'],
      target: ['B', 'A', 'C', 'D'],
      hand: [
        {
          id: 'design-1',
          command: { type: 'REVERSE', l: 0, r: 2 },
        },
        {
          id: 'design-2',
          command: { type: 'MOVE', a: 0, b: 2 },
        },
        {
          id: 'extra-one-move',
          command: { type: 'SWAP', a: 0, b: 1 },
        },
      ],
      designSolution: [
        { type: 'REVERSE', l: 0, r: 2 },
        { type: 'MOVE', a: 0, b: 2 },
      ],
      designSolutionCardIds: ['design-1', 'design-2'],
      designSteps: 2,
    }

    const report = analyzePuzzleQuality(puzzle)

    expect(report.accepted).toBe(false)
    expect(report.rejectReasons).toContain('SINGLE_MOVE_NON_TUTORIAL')
  })
})

