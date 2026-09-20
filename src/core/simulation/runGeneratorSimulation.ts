import { applyCommand } from '../commands/applyCommand'
import {
  GENERATOR_DIFFICULTIES,
  generatePuzzleWithReport,
  type GeneratedPuzzleResult,
  type GeneratorDifficulty,
} from '../generator/generatePuzzle'
import {
  PUZZLE_DIFFICULTIES,
  PUZZLE_STYLE_TAGS,
  type PuzzleDifficulty,
  type PuzzleStyleTag,
} from '../../domain/puzzleQuality'

export type GeneratorSimulationOptions = {
  samplesPerDifficulty: number
  seedStart?: number
  onProgress?: (completed: number, total: number) => void
}

export type SimulationFailure = {
  difficulty: GeneratorDifficulty
  seed: number
  reasons: string[]
}

export type DifficultySimulationSummary = {
  requestedDifficulty: GeneratorDifficulty
  requestedCount: number
  generatedCount: number
  failedCount: number
  averageQuality: number
  minimumQuality: number
  maximumQuality: number
  averageGenerationAttempts: number
  maximumGenerationAttempts: number
  averageStartStructuralScore: number
  estimatedDifficultyCounts: Record<PuzzleDifficulty, number>
  styleTagCounts: Record<PuzzleStyleTag, number>
}

export type GeneratorSimulationReport = {
  simulationVersion: 'v4'
  generatedAt: string
  samplesPerDifficulty: number
  seedStart: number
  totalRequested: number
  totalGenerated: number
  totalFailed: number
  allPassed: boolean
  durationMs: number
  difficultySummaries: DifficultySimulationSummary[]
  failures: SimulationFailure[]
}

function arraysEqual(
  left: readonly unknown[],
  right: readonly unknown[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function createDifficultyCounts(): Record<PuzzleDifficulty, number> {
  return Object.fromEntries(
    PUZZLE_DIFFICULTIES.map((difficulty) => [difficulty, 0]),
  ) as Record<PuzzleDifficulty, number>
}

function createStyleTagCounts(): Record<PuzzleStyleTag, number> {
  return Object.fromEntries(
    PUZZLE_STYLE_TAGS.map((tag) => [tag, 0]),
  ) as Record<PuzzleStyleTag, number>
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function validateGeneratedPuzzleResult(
  result: GeneratedPuzzleResult,
): string[] {
  const { puzzle, qualityReport } = result
  const reasons: string[] = []
  const targetKey = JSON.stringify(puzzle.target)
  const cardIds = puzzle.hand.map((card) => card.id)
  const designCardIdSet = new Set(puzzle.designSolutionCardIds)

  const solved = puzzle.designSolution.reduce(
    (current, command) => applyCommand(current, command),
    puzzle.start,
  )

  if (!arraysEqual(solved, puzzle.target)) {
    reasons.push('DESIGN_SOLUTION_DOES_NOT_CLEAR')
  }
  if (arraysEqual(puzzle.start, puzzle.target)) {
    reasons.push('START_EQUALS_TARGET')
  }
  if (
    puzzle.hand.some(
      (card) =>
        JSON.stringify(applyCommand(puzzle.start, card.command)) ===
        targetKey,
    )
  ) {
    reasons.push('ONE_MOVE_CLEAR_EXISTS')
  }
  if (
    puzzle.designSteps !== puzzle.designSolution.length ||
    puzzle.designSteps !== puzzle.designSolutionCardIds.length
  ) {
    reasons.push('DESIGN_STEP_METADATA_MISMATCH')
  }
  if (new Set(cardIds).size !== cardIds.length) {
    reasons.push('DUPLICATE_CARD_ID')
  }
  if (designCardIdSet.size !== puzzle.designSolutionCardIds.length) {
    reasons.push('DUPLICATE_DESIGN_CARD_ID')
  }
  if (
    puzzle.designSolutionCardIds.some(
      (cardId) => !cardIds.includes(cardId),
    )
  ) {
    reasons.push('DESIGN_CARD_NOT_IN_HAND')
  }

  const indexArray = puzzle.start.map((_, index) => index)
  const effectKeys = puzzle.hand.map((card) =>
    JSON.stringify(applyCommand(indexArray, card.command)),
  )
  if (new Set(effectKeys).size !== effectKeys.length) {
    reasons.push('DUPLICATE_COMMAND_EFFECT')
  }

  const orderHint = puzzle.assistConfig?.orderHint
  if (
    !orderHint ||
    orderHint.step < 2 ||
    orderHint.step > puzzle.designSteps ||
    puzzle.designSolutionCardIds[orderHint.step - 1] !== orderHint.cardId
  ) {
    reasons.push('INVALID_ORDER_HINT')
  }
  if (!qualityReport.accepted || qualityReport.rejectReasons.length > 0) {
    reasons.push('QUALITY_GATE_NOT_PASSED')
  }

  const qualityValues = Object.values(qualityReport.qualityScores)
  if (qualityValues.some((score) => score < 0 || score > 100)) {
    reasons.push('QUALITY_SCORE_OUT_OF_RANGE')
  }
  if (
    new Set(qualityReport.styleTags).size !==
    qualityReport.styleTags.length
  ) {
    reasons.push('DUPLICATE_STYLE_TAG')
  }

  return reasons
}

export function runGeneratorSimulation({
  samplesPerDifficulty,
  seedStart = 1,
  onProgress,
}: GeneratorSimulationOptions): GeneratorSimulationReport {
  if (!Number.isInteger(samplesPerDifficulty) || samplesPerDifficulty <= 0) {
    throw new Error('samplesPerDifficultyは1以上の整数で指定してください。')
  }
  if (!Number.isInteger(seedStart)) {
    throw new Error('seedStartは整数で指定してください。')
  }

  const startedAt = Date.now()
  const failures: SimulationFailure[] = []
  const totalRequested =
    samplesPerDifficulty * GENERATOR_DIFFICULTIES.length
  let completed = 0

  const difficultySummaries = GENERATOR_DIFFICULTIES.map(
    (difficulty): DifficultySimulationSummary => {
      let generatedCount = 0
      let qualityTotal = 0
      let minimumQuality = 100
      let maximumQuality = 0
      let attemptTotal = 0
      let maximumGenerationAttempts = 0
      let startStructuralScoreTotal = 0
      const estimatedDifficultyCounts = createDifficultyCounts()
      const styleTagCounts = createStyleTagCounts()

      for (let offset = 0; offset < samplesPerDifficulty; offset += 1) {
        const seed = seedStart + offset

        try {
          const result = generatePuzzleWithReport({ difficulty, seed })
          const reasons = validateGeneratedPuzzleResult(result)

          if (reasons.length > 0) {
            failures.push({ difficulty, seed, reasons })
          } else {
            const quality = result.qualityReport.qualityScores.overall
            generatedCount += 1
            qualityTotal += quality
            minimumQuality = Math.min(minimumQuality, quality)
            maximumQuality = Math.max(maximumQuality, quality)
            attemptTotal += result.generationAttempts
            maximumGenerationAttempts = Math.max(
              maximumGenerationAttempts,
              result.generationAttempts,
            )
            startStructuralScoreTotal +=
              result.qualityReport.startMetrics.score
            estimatedDifficultyCounts[
              result.qualityReport.estimatedDifficulty
            ] += 1

            for (const tag of result.qualityReport.styleTags) {
              styleTagCounts[tag] += 1
            }
          }
        } catch (error) {
          failures.push({
            difficulty,
            seed,
            reasons: [
              error instanceof Error
                ? 'GENERATION_ERROR: ' + error.message
                : 'GENERATION_ERROR',
            ],
          })
        }

        completed += 1
        onProgress?.(completed, totalRequested)
      }

      const failedCount = samplesPerDifficulty - generatedCount

      return {
        requestedDifficulty: difficulty,
        requestedCount: samplesPerDifficulty,
        generatedCount,
        failedCount,
        averageQuality:
          generatedCount > 0 ? round(qualityTotal / generatedCount) : 0,
        minimumQuality: generatedCount > 0 ? minimumQuality : 0,
        maximumQuality,
        averageGenerationAttempts:
          generatedCount > 0 ? round(attemptTotal / generatedCount) : 0,
        maximumGenerationAttempts,
        averageStartStructuralScore:
          generatedCount > 0
            ? round(startStructuralScoreTotal / generatedCount)
            : 0,
        estimatedDifficultyCounts,
        styleTagCounts,
      }
    },
  )

  const totalGenerated = difficultySummaries.reduce(
    (sum, summary) => sum + summary.generatedCount,
    0,
  )

  return {
    simulationVersion: 'v4',
    generatedAt: new Date().toISOString(),
    samplesPerDifficulty,
    seedStart,
    totalRequested,
    totalGenerated,
    totalFailed: failures.length,
    allPassed: failures.length === 0,
    durationMs: Date.now() - startedAt,
    difficultySummaries,
    failures,
  }
}

