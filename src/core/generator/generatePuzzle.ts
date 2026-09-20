import type { Command } from '../../domain/command'
import type { CommandCard } from '../../domain/commandCard'
import type { PuzzleDefinition } from '../../domain/puzzle'
import { applyCommand } from '../commands/applyCommand'
import { analyzePuzzleQuality } from '../quality/analyzePuzzleQuality'
import type { PuzzleQualityReport } from '../../domain/puzzleQuality'

export const GENERATOR_DIFFICULTIES = [
  'EASY',
  'NORMAL',
  'HARD',
  'VERY_HARD',
] as const

export type GeneratorDifficulty =
  (typeof GENERATOR_DIFFICULTIES)[number]

export type GeneratePuzzleOptions = {
  difficulty: GeneratorDifficulty
  seed: number
}

export type GeneratedPuzzleResult = {
  puzzle: PuzzleDefinition
  qualityReport: PuzzleQualityReport
  requestedDifficulty: GeneratorDifficulty
  generationAttempts: number
}

export type GeneratorPreset = {
  arrayLength: number
  designSteps: number
  extraCardCount: number
}

type RandomSource = () => number

const SYMBOLS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
]

const GENERATOR_PRESETS: Record<
  GeneratorDifficulty,
  GeneratorPreset
> = {
  EASY: {
    arrayLength: 6,
    designSteps: 3,
    extraCardCount: 2,
  },
  NORMAL: {
    arrayLength: 7,
    designSteps: 4,
    extraCardCount: 3,
  },
  HARD: {
    arrayLength: 8,
    designSteps: 5,
    extraCardCount: 3,
  },
  VERY_HARD: {
    arrayLength: 8,
    designSteps: 6,
    extraCardCount: 2,
  },
}

export function normalizeGeneratorSeed(
  seed: number,
): number {
  if (!Number.isFinite(seed)) {
    return 1
  }

  return Math.trunc(seed) >>> 0
}

export function createRandomSeed(
  random: RandomSource = Math.random,
): number {
  return (
    Math.floor(
      random() * 999_999_999,
    ) + 1
  )
}

export function createSeededRandom(
  seed: number,
): RandomSource {
  let state = normalizeGeneratorSeed(seed)

  return () => {
    state =
      (state + 0x6d2b79f5) >>> 0

    let value = state

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1,
    )

    value ^=
      value +
      Math.imul(
        value ^ (value >>> 7),
        value | 61,
      )

    return (
      (
        value ^
        (value >>> 14)
      ) >>> 0
    ) / 4_294_967_296
  }
}

export function getGeneratorPreset(
  difficulty: GeneratorDifficulty,
): GeneratorPreset {
  return GENERATOR_PRESETS[difficulty]
}

function randomInteger(
  random: RandomSource,
  minimum: number,
  maximum: number,
): number {
  return (
    Math.floor(
      random() *
        (maximum - minimum + 1),
    ) + minimum
  )
}

function shuffleArray<T>(
  values: readonly T[],
  random: RandomSource,
): T[] {
  const result = [...values]

  for (
    let index = result.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex =
      randomInteger(
        random,
        0,
        index,
      )

    const temporary = result[index]

    result[index] =
      result[randomIndex]

    result[randomIndex] =
      temporary
  }

  return result
}

function createDistinctIndices(
  arrayLength: number,
  random: RandomSource,
): [number, number] {
  const first = randomInteger(
    random,
    0,
    arrayLength - 1,
  )

  let second = randomInteger(
    random,
    0,
    arrayLength - 2,
  )

  if (second >= first) {
    second += 1
  }

  return [first, second]
}

function createOrderedRange(
  arrayLength: number,
  random: RandomSource,
): [number, number] {
  const [first, second] =
    createDistinctIndices(
      arrayLength,
      random,
    )

  return [
    Math.min(first, second),
    Math.max(first, second),
  ]
}

function createRandomCommand(
  arrayLength: number,
  random: RandomSource,
): Command {
  const commandType =
    randomInteger(random, 0, 3)

  if (commandType === 0) {
    const [a, b] =
      createDistinctIndices(
        arrayLength,
        random,
      )

    return {
      type: 'SWAP',
      a,
      b,
    }
  }

  if (commandType === 1) {
    const [l, r] =
      createOrderedRange(
        arrayLength,
        random,
      )

    return {
      type: 'REVERSE',
      l,
      r,
    }
  }

  if (commandType === 2) {
    const [l, r] =
      createOrderedRange(
        arrayLength,
        random,
      )

    const sectionLength =
      r - l + 1

    const magnitude =
      randomInteger(
        random,
        1,
        sectionLength - 1,
      )

    const direction =
      random() < 0.5 ? -1 : 1

    return {
      type: 'ROTATE',
      l,
      r,
      k: magnitude * direction,
    }
  }

  const [a, b] =
    createDistinctIndices(
      arrayLength,
      random,
    )

  return {
    type: 'MOVE',
    a,
    b,
  }
}

function getArrayKey(
  values: readonly unknown[],
): string {
  return JSON.stringify(values)
}

/**
 * CommandをIndex配列へ適用し、
 * Commandが表す並べ替えそのものを識別する。
 *
 * REVERSE(1, 2)とSWAP(1, 2)など、
 * 記法は異なるが結果が完全に同じカードも
 * 同一Effectとして扱う。
 */
function getCommandEffectKey(
  command: Command,
  arrayLength: number,
): string {
  const indices = Array.from(
    { length: arrayLength },
    (_, index) => index,
  )

  return getArrayKey(
    applyCommand(indices, command),
  )
}

function createStartArray(
  arrayLength: number,
  random: RandomSource,
): string[] {
  return shuffleArray(
    SYMBOLS.slice(0, arrayLength),
    random,
  )
}

function createDesignSolution(
  start: readonly string[],
  designSteps: number,
  random: RandomSource,
): {
  commands: Command[]
  target: string[]
  effectKeys: Set<string>
} {
  for (
    let restartAttempt = 0;
    restartAttempt < 100;
    restartAttempt += 1
  ) {
    const commands: Command[] = []
    const effectKeys = new Set<string>()
    const visitedStates = new Set<string>([
      getArrayKey(start),
    ])

    let currentArray = [...start]
    let commandAttempt = 0

    while (
      commands.length < designSteps &&
      commandAttempt < 2_000
    ) {
      commandAttempt += 1

      const command =
        createRandomCommand(
          start.length,
          random,
        )

      const effectKey =
        getCommandEffectKey(
          command,
          start.length,
        )

      if (effectKeys.has(effectKey)) {
        continue
      }

      const nextArray = applyCommand(
        currentArray,
        command,
      )

      const nextStateKey =
        getArrayKey(nextArray)

      /*
       * STARTへ戻る完全相殺や、
       * 途中状態へ戻るループを除外する。
       */
      if (
        visitedStates.has(nextStateKey)
      ) {
        continue
      }

      commands.push(command)
      effectKeys.add(effectKey)
      visitedStates.add(nextStateKey)

      currentArray = nextArray
    }

    if (
      commands.length === designSteps &&
      getArrayKey(currentArray) !==
        getArrayKey(start)
    ) {
      return {
        commands,
        target: currentArray,
        effectKeys,
      }
    }
  }

  throw new Error(
    'Design Solutionを生成できませんでした。',
  )
}

function createExtraCommands(
  start: readonly string[],
  target: readonly string[],
  extraCardCount: number,
  usedEffectKeys: Set<string>,
  random: RandomSource,
): Command[] {
  const extraCommands: Command[] = []
  const targetKey = getArrayKey(target)

  let attempt = 0

  while (
    extraCommands.length <
      extraCardCount &&
    attempt < 2_000
  ) {
    attempt += 1

    const command =
      createRandomCommand(
        start.length,
        random,
      )

    const effectKey =
      getCommandEffectKey(
        command,
        start.length,
      )

    if (
      usedEffectKeys.has(effectKey)
    ) {
      continue
    }

    const resultFromStart =
      applyCommand(start, command)

    /*
     * Extra Cardを1枚使うだけで
     * TARGETへ到達する問題は除外する。
     */
    if (
      getArrayKey(resultFromStart) ===
      targetKey
    ) {
      continue
    }

    usedEffectKeys.add(effectKey)
    extraCommands.push(command)
  }

  if (
    extraCommands.length !==
    extraCardCount
  ) {
    throw new Error(
      'Extra Cardを生成できませんでした。',
    )
  }

  return extraCommands
}

function createCardId(
  difficulty: GeneratorDifficulty,
  seed: number,
  cardNumber: number,
): string {
  return [
    'gen',
    difficulty.toLowerCase(),
    seed,
    'card',
    cardNumber,
  ].join('-')
}

function generatePuzzleCandidate({
  difficulty,
  seed,
}: GeneratePuzzleOptions): PuzzleDefinition {
  const normalizedSeed =
    normalizeGeneratorSeed(seed)

  const random =
    createSeededRandom(normalizedSeed)

  const preset =
    getGeneratorPreset(difficulty)

  const start = createStartArray(
    preset.arrayLength,
    random,
  )

  const {
    commands: designSolution,
    target,
    effectKeys,
  } = createDesignSolution(
    start,
    preset.designSteps,
    random,
  )

  const extraCommands =
    createExtraCommands(
      start,
      target,
      preset.extraCardCount,
      effectKeys,
      random,
    )

  const allCommands = [
    ...designSolution,
    ...extraCommands,
  ]

  const hand: CommandCard[] =
    allCommands.map(
      (command, index) => ({
        id: createCardId(
          difficulty,
          normalizedSeed,
          index + 1,
        ),
        command,
      }),
    )

  const designSolutionCardIds =
    hand
      .slice(
        0,
        preset.designSteps,
      )
      .map((card) => card.id)

  const orderHintStep =
    randomInteger(
      random,
      2,
      preset.designSteps,
    )

  return {
    id:
      `GEN-${difficulty}-${normalizedSeed}`,
    start,
    target,
    hand,
    designSolution,
    designSolutionCardIds,
    designSteps:
      designSolution.length,
    assistConfig: {
      orderHint: {
        cardId:
          designSolutionCardIds[
            orderHintStep - 1
          ],
        step: orderHintStep,
      },
    },
  }
}

const MAX_QUALITY_GATE_ATTEMPTS = 200

function createCandidateSeed(seed: number, attempt: number): number {
  return normalizeGeneratorSeed(
    seed + Math.imul(attempt, 0x9e3779b1),
  )
}

/**
 * 同じseedとdifficultyから、必ず同じ合格済み問題を返す。
 * 候補がQuality Gateを通らない場合だけ派生seedで再生成する。
 */
export function generatePuzzleWithReport({
  difficulty,
  seed,
}: GeneratePuzzleOptions): GeneratedPuzzleResult {
  const normalizedSeed = normalizeGeneratorSeed(seed)

  for (let attempt = 0; attempt < MAX_QUALITY_GATE_ATTEMPTS; attempt += 1) {
    const candidateSeed = createCandidateSeed(normalizedSeed, attempt)

    try {
      const puzzle = generatePuzzleCandidate({
        difficulty,
        seed: candidateSeed,
      })
      const qualityReport = analyzePuzzleQuality(puzzle)

      if (qualityReport.accepted) {
        return {
          puzzle,
          qualityReport,
          requestedDifficulty: difficulty,
          generationAttempts: attempt + 1,
        }
      }
    } catch {
      // 生成不能な候補は捨て、次の決定論的な候補を試す。
    }
  }

  throw new Error('Quality Gateを通過する問題を生成できませんでした。')
}

export function generatePuzzle(
  options: GeneratePuzzleOptions,
): PuzzleDefinition {
  return generatePuzzleWithReport(options).puzzle
}

