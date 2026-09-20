export const PUZZLE_DIFFICULTIES = [
  'EASY',
  'NORMAL',
  'HARD',
  'VERY_HARD',
] as const

export type PuzzleDifficulty = (typeof PUZZLE_DIFFICULTIES)[number]

export const PUZZLE_STYLE_TAGS = [
  'PROGRESSIVE',
  'AMBIGUOUS',
  'SACRIFICE',
  'TRAP',
  'COMBO',
  'BIG_FINISH',
  'BLOCK_BUILD',
  'DEEP_SETUP',
] as const

export type PuzzleStyleTag = (typeof PUZZLE_STYLE_TAGS)[number]

export type StructuralMetrics = {
  positionMatches: number
  targetAdjacentPairs: number
  lcsLength: number
  longestTargetBlock: number
  score: number
}

export type PuzzleStepMetrics = {
  step: number
  metrics: StructuralMetrics
  scoreDelta: number
}

export type PuzzleQualityScores = {
  coherence: number
  choice: number
  interaction: number
  economy: number
  payoff: number
  fairness: number
  overall: number
}

export type QualityRejectReason =
  | 'START_EQUALS_TARGET'
  | 'SINGLE_MOVE_NON_TUTORIAL'
  | 'START_TOO_CLOSE'
  | 'LONG_STAGNATION'
  | 'USELESS_EXTRA_CARDS'
  | 'LOW_QUALITY_SCORE'

export type PuzzleQualityReport = {
  accepted: boolean
  rejectReasons: QualityRejectReason[]
  estimatedDifficulty: PuzzleDifficulty
  difficultyScore: number
  styleTags: PuzzleStyleTag[]
  qualityScores: PuzzleQualityScores
  startMetrics: StructuralMetrics
  stepMetrics: PuzzleStepMetrics[]
  improvedStepCount: number
  regressedStepCount: number
  longestNoImprovementRun: number
  attractiveExtraCardIds: string[]
  uselessExtraCardIds: string[]
}
