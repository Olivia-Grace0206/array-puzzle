import { describe, expect, it } from 'vitest'
import {
  runGeneratorSimulation,
  validateGeneratedPuzzleResult,
} from '../src/core/simulation/runGeneratorSimulation'
import { generatePuzzleWithReport } from '../src/core/generator/generatePuzzle'

describe('generator simulation', () => {
  it('全難易度をまとめて検証し、失敗0件のReportを返す', () => {
    const report = runGeneratorSimulation({
      samplesPerDifficulty: 50,
      seedStart: 1,
    })

    expect(report.totalRequested).toBe(200)
    expect(report.totalGenerated).toBe(200)
    expect(report.totalFailed).toBe(0)
    expect(report.allPassed).toBe(true)
    expect(report.failures).toEqual([])
    expect(report.difficultySummaries).toHaveLength(4)

    const easy = report.difficultySummaries.find(
      (summary) => summary.requestedDifficulty === 'EASY',
    )
    const veryHard = report.difficultySummaries.find(
      (summary) => summary.requestedDifficulty === 'VERY_HARD',
    )

    expect(easy).toBeDefined()
    expect(veryHard).toBeDefined()
    expect(easy!.styleTagCounts.PROGRESSIVE).toBeGreaterThan(
      veryHard!.styleTagCounts.PROGRESSIVE,
    )
    expect(veryHard!.styleTagCounts.SACRIFICE).toBeGreaterThan(
      easy!.styleTagCounts.SACRIFICE,
    )
    expect(veryHard!.styleTagCounts.COMBO).toBeGreaterThan(
      easy!.styleTagCounts.COMBO,
    )
  })

  it('生成結果の単体Invariant検証が成功する', () => {
    const result = generatePuzzleWithReport({
      difficulty: 'VERY_HARD',
      seed: 987654321,
    })

    expect(validateGeneratedPuzzleResult(result)).toEqual([])
  })

  it('Simulation件数に0以下や小数を指定できない', () => {
    expect(() =>
      runGeneratorSimulation({ samplesPerDifficulty: 0 }),
    ).toThrow()
    expect(() =>
      runGeneratorSimulation({ samplesPerDifficulty: 1.5 }),
    ).toThrow()
  })
})

