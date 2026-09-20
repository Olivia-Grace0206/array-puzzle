import { ASSIST_TYPES } from '../../domain/assist'
import type {
  AssistHistory,
  AssistType,
} from '../../domain/assist'
import type { GameSaveData } from '../../domain/gameSave'
import type { HandOrderHistory } from '../../domain/handOrder'
import type {
  ProgressHistory,
  PuzzleCompletionStatus,
} from '../../domain/progress'
import { createAssistHistory } from '../assist/assistHistory'
import { createHandOrderHistory } from '../hand/handOrder'
import { createProgressHistory } from '../progress/progressHistory'

export const GAME_STORAGE_KEY =
  'array-puzzle-save-v1'

export type GameStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function createEmptyGameSave(): GameSaveData {
  return {
    version: 1,
    assistHistory: createAssistHistory(),
    handOrderHistory: createHandOrderHistory(),
    progressHistory: createProgressHistory(),
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isAssistType(
  value: unknown,
): value is AssistType {
  return (
    typeof value === 'string' &&
    ASSIST_TYPES.some(
      (assistType) => assistType === value,
    )
  )
}

function isAssistHistory(
  value: unknown,
): value is AssistHistory {
  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every(
    (puzzleAssistState) => {
      if (!isRecord(puzzleAssistState)) {
        return false
      }

      const usedAssistTypes =
        puzzleAssistState.usedAssistTypes

      if (
        !Array.isArray(usedAssistTypes) ||
        !usedAssistTypes.every(isAssistType)
      ) {
        return false
      }

      const nextMoveCardId =
        puzzleAssistState.nextMoveCardId

      return (
        nextMoveCardId === undefined ||
        typeof nextMoveCardId === 'string'
      )
    },
  )
}

function isHandOrderHistory(
  value: unknown,
): value is HandOrderHistory {
  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every(
    (cardIds) =>
      Array.isArray(cardIds) &&
      cardIds.every(
        (cardId) =>
          typeof cardId === 'string',
      ),
  )
}

function isCompletionStatus(
  value: unknown,
): value is PuzzleCompletionStatus {
  return (
    value === 'UNPLAYED' ||
    value === 'CLEARED' ||
    value === 'SKIPPED'
  )
}

function isProgressHistory(
  value: unknown,
): value is ProgressHistory {
  if (!isRecord(value)) {
    return false
  }

  return Object.values(value).every(
    (puzzleProgress) => {
      if (!isRecord(puzzleProgress)) {
        return false
      }

      if (
        !isCompletionStatus(
          puzzleProgress.status,
        )
      ) {
        return false
      }

      const bestStars =
        puzzleProgress.bestStars

      return (
        bestStars === undefined ||
        (
          typeof bestStars === 'number' &&
          Number.isInteger(bestStars) &&
          bestStars >= 0 &&
          bestStars <= 3
        )
      )
    },
  )
}

function isGameSaveData(
  value: unknown,
): value is GameSaveData {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.version === 1 &&
    isAssistHistory(value.assistHistory) &&
    isHandOrderHistory(
      value.handOrderHistory,
    ) &&
    isProgressHistory(
      value.progressHistory,
    )
  )
}

export function loadGameSave(
  storage: GameStorage,
): GameSaveData {
  try {
    const storedValue = storage.getItem(
      GAME_STORAGE_KEY,
    )

    if (!storedValue) {
      return createEmptyGameSave()
    }

    const parsedValue: unknown =
      JSON.parse(storedValue)

    if (!isGameSaveData(parsedValue)) {
      return createEmptyGameSave()
    }

    return parsedValue
  } catch {
    return createEmptyGameSave()
  }
}

export function saveGameSave(
  storage: GameStorage,
  gameSave: GameSaveData,
): boolean {
  try {
    storage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify(gameSave),
    )

    return true
  } catch {
    return false
  }
}