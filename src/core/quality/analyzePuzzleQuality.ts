import { applyCommand } from '../commands/applyCommand'
import type { Command } from '../../domain/command'
import type { PuzzleDefinition } from '../../domain/puzzle'
import type {
  PuzzleDifficulty,
  PuzzleQualityReport,
  PuzzleQualityScores,
  PuzzleStepMetrics,
  PuzzleStyleTag,
  QualityRejectReason,
  StructuralMetrics,
} from '../../domain/puzzleQuality'
import { calculateStructuralMetrics } from './structuralMetrics'

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function getAffectedIndices(command: Command): number[] {
  const [first, second] =
    command.type === 'SWAP' || command.type === 'MOVE'
      ? [command.a, command.b]
      : [command.l, command.r]
  const start = Math.min(first, second)
  const end = Math.max(first, second)
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset)
}

function commandsOverlap(first: Command, second: Command): boolean {
  const firstIndices = new Set(getAffectedIndices(first))
  return getAffectedIndices(second).some((index) => firstIndices.has(index))
}

function estimateDifficulty(
  puzzle: PuzzleDefinition,
  startMetrics: StructuralMetrics,
  commandTypeCount: number,
  regressedStepCount: number,
  longestNoImprovementRun: number,
): { difficulty: PuzzleDifficulty; score: number } {
  const extraCardCount = Math.max(0, puzzle.hand.length - puzzle.designSteps)
  const score = Math.round(
    puzzle.designSteps * 10 +
      extraCardCount * 3 +
      commandTypeCount * 3 +
      (100 - startMetrics.score) * 0.12 +
      regressedStepCount * 3 +
      longestNoImprovementRun * 2,
  )

  if (score <= 56) {
    return { difficulty: 'EASY', score }
  }
  if (score <= 70) {
    return { difficulty: 'NORMAL', score }
  }
  if (score <= 82) {
    return { difficulty: 'HARD', score }
  }
  return { difficulty: 'VERY_HARD', score }
}

function isImmediatelyAttractive(
  metrics: StructuralMetrics,
  startMetrics: StructuralMetrics,
): boolean {
  return (
    metrics.score >= startMetrics.score + 3 ||
    metrics.targetAdjacentPairs > startMetrics.targetAdjacentPairs ||
    metrics.longestTargetBlock > startMetrics.longestTargetBlock
  )
}

function isClearlyUseless(
  metrics: StructuralMetrics,
  startMetrics: StructuralMetrics,
): boolean {
  return (
    metrics.score <= startMetrics.score &&
    metrics.positionMatches <= startMetrics.positionMatches &&
    metrics.targetAdjacentPairs <= startMetrics.targetAdjacentPairs &&
    metrics.lcsLength <= startMetrics.lcsLength &&
    metrics.longestTargetBlock <= startMetrics.longestTargetBlock
  )
}

export function analyzePuzzleQuality(
  puzzle: PuzzleDefinition,
): PuzzleQualityReport {
  const startMetrics = calculateStructuralMetrics(puzzle.start, puzzle.target)
  const stepMetrics: PuzzleStepMetrics[] = [
    { step: 0, metrics: startMetrics, scoreDelta: 0 },
  ]

  let current = [...puzzle.start]
  let improvedStepCount = 0
  let regressedStepCount = 0
  let noImprovementRun = 0
  let longestNoImprovementRun = 0

  puzzle.designSolution.forEach((command, index) => {
    const previousScore = stepMetrics[stepMetrics.length - 1].metrics.score
    current = applyCommand(current, command)
    const metrics = calculateStructuralMetrics(current, puzzle.target)
    const scoreDelta = metrics.score - previousScore

    if (scoreDelta > 0) {
      improvedStepCount += 1
      noImprovementRun = 0
    } else {
      if (scoreDelta < 0) {
        regressedStepCount += 1
      }
      noImprovementRun += 1
      longestNoImprovementRun = Math.max(
        longestNoImprovementRun,
        noImprovementRun,
      )
    }

    stepMetrics.push({ step: index + 1, metrics, scoreDelta })
  })

  const designCardIds = new Set(puzzle.designSolutionCardIds)
  const extraCards = puzzle.hand.filter((card) => !designCardIds.has(card.id))
  const attractiveExtraCardIds: string[] = []
  const uselessExtraCardIds: string[] = []

  for (const card of extraCards) {
    const result = applyCommand(puzzle.start, card.command)
    const metrics = calculateStructuralMetrics(result, puzzle.target)

    if (isImmediatelyAttractive(metrics, startMetrics)) {
      attractiveExtraCardIds.push(card.id)
    }
    if (isClearlyUseless(metrics, startMetrics)) {
      uselessExtraCardIds.push(card.id)
    }
  }

  const commandTypes = new Set(
    puzzle.designSolution.map((command) => command.type),
  )
  let overlapCount = 0
  for (let index = 1; index < puzzle.designSolution.length; index += 1) {
    if (
      commandsOverlap(
        puzzle.designSolution[index - 1],
        puzzle.designSolution[index],
      )
    ) {
      overlapCount += 1
    }
  }

  const transitionCount = Math.max(1, puzzle.designSolution.length - 1)
  const improvementRatio =
    improvedStepCount / Math.max(1, puzzle.designSolution.length)
  const overlapRatio = overlapCount / transitionCount
  const nonImprovingSteps =
    puzzle.designSolution.length - improvedStepCount
  const finalDelta =
    stepMetrics[stepMetrics.length - 1]?.scoreDelta ?? 0
  const priorDeltas = stepMetrics.slice(1, -1).map((step) => step.scoreDelta)
  const largestPriorDelta = Math.max(0, ...priorDeltas)
  const adjacentPairBuildSteps = stepMetrics
    .slice(1)
    .filter(
      (step, index) =>
        step.metrics.targetAdjacentPairs >
        stepMetrics[index].metrics.targetAdjacentPairs,
    ).length

  const duplicateEffects =
    new Set(
      puzzle.hand.map((card) =>
        JSON.stringify(applyCommand(puzzle.start, card.command)),
      ),
    ).size !== puzzle.hand.length

  const qualityScores: PuzzleQualityScores = {
    coherence: clampScore(
      48 +
        improvementRatio * 42 -
        regressedStepCount * 7 -
        longestNoImprovementRun * 5,
    ),
    choice: clampScore(
      42 +
        Math.min(extraCards.length, 4) * 8 +
        attractiveExtraCardIds.length * 10 -
        Math.max(0, uselessExtraCardIds.length - 1) * 6,
    ),
    interaction: clampScore(
      35 + commandTypes.size * 12 + overlapRatio * 24,
    ),
    economy: clampScore(
      92 -
        nonImprovingSteps * 7 -
        Math.max(0, puzzle.hand.length - puzzle.designSteps - 3) * 5,
    ),
    payoff: clampScore(
      42 + (100 - startMetrics.score) * 0.38 + finalDelta * 0.65,
    ),
    fairness: clampScore(
      60 +
        attractiveExtraCardIds.length * 8 -
        uselessExtraCardIds.length * 5 -
        (duplicateEffects ? 18 : 0),
    ),
    overall: 0,
  }

  qualityScores.overall = clampScore(
    (qualityScores.coherence +
      qualityScores.choice +
      qualityScores.interaction +
      qualityScores.economy +
      qualityScores.payoff +
      qualityScores.fairness) /
      6,
  )

  const firstHalfEnd = Math.ceil(puzzle.designSolution.length / 2)
  const firstHalfImprovement = stepMetrics
    .slice(1, firstHalfEnd + 1)
    .reduce((sum, step) => sum + Math.max(0, step.scoreDelta), 0)
  const secondHalfImprovement = stepMetrics
    .slice(firstHalfEnd + 1)
    .reduce((sum, step) => sum + Math.max(0, step.scoreDelta), 0)

  const styleTags: PuzzleStyleTag[] = []
  if (
    regressedStepCount === 0 &&
    improvedStepCount >= Math.ceil(puzzle.designSolution.length * 0.6)
  ) {
    styleTags.push('PROGRESSIVE')
  }
  if (attractiveExtraCardIds.length > 0 && extraCards.length >= 2) {
    styleTags.push('AMBIGUOUS', 'TRAP')
  }
  if (regressedStepCount > 0) {
    styleTags.push('SACRIFICE')
  }
  if (commandTypes.size >= 3 && overlapCount > 0) {
    styleTags.push('COMBO')
  }
  if (finalDelta >= 12 && finalDelta >= largestPriorDelta) {
    styleTags.push('BIG_FINISH')
  }
  if (adjacentPairBuildSteps >= 2) {
    styleTags.push('BLOCK_BUILD')
  }
  if (
    puzzle.designSolution.length >= 4 &&
    secondHalfImprovement >= firstHalfImprovement + 12
  ) {
    styleTags.push('DEEP_SETUP')
  }

  const difficulty = estimateDifficulty(
    puzzle,
    startMetrics,
    commandTypes.size,
    regressedStepCount,
    longestNoImprovementRun,
  )

  const rejectReasons: QualityRejectReason[] = []
  if (arraysEqual(puzzle.start, puzzle.target)) {
    rejectReasons.push('START_EQUALS_TARGET')
  }
  if (puzzle.designSteps <= 1) {
    rejectReasons.push('SINGLE_MOVE_NON_TUTORIAL')
  }
  if (
    startMetrics.score >= 82 ||
    startMetrics.positionMatches >= Math.max(1, puzzle.target.length - 1)
  ) {
    rejectReasons.push('START_TOO_CLOSE')
  }
  if (longestNoImprovementRun >= 3) {
    rejectReasons.push('LONG_STAGNATION')
  }
  if (
    extraCards.length > 0 &&
    uselessExtraCardIds.length === extraCards.length
  ) {
    rejectReasons.push('USELESS_EXTRA_CARDS')
  }
  if (qualityScores.overall < 50) {
    rejectReasons.push('LOW_QUALITY_SCORE')
  }

  return {
    accepted: rejectReasons.length === 0,
    rejectReasons,
    estimatedDifficulty: difficulty.difficulty,
    difficultyScore: difficulty.score,
    styleTags: [...new Set(styleTags)],
    qualityScores,
    startMetrics,
    stepMetrics,
    improvedStepCount,
    regressedStepCount,
    longestNoImprovementRun,
    attractiveExtraCardIds,
    uselessExtraCardIds,
  }
}
