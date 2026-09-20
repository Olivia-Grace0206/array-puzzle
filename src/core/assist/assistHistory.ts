import type {
  AssistHistory,
  AssistType,
} from '../../domain/assist'

const EMPTY_USED_ASSIST_TYPES: readonly AssistType[] = []

export function createAssistHistory(): AssistHistory {
  return {}
}

export function getUsedAssistTypes(
  history: AssistHistory,
  puzzleId: string,
): readonly AssistType[] {
  return history[puzzleId] ?? EMPTY_USED_ASSIST_TYPES
}

export function hasAssistBeenUsed(
  history: AssistHistory,
  puzzleId: string,
  assistType: AssistType,
): boolean {
  return getUsedAssistTypes(
    history,
    puzzleId,
  ).includes(assistType)
}

/**
 * Assist使用履歴を問題単位で記録する。
 *
 * 同じAssistがすでに使用済みの場合は、
 * 履歴を変更せず同じオブジェクトを返す。
 */
export function recordAssistUsage(
  history: AssistHistory,
  puzzleId: string,
  assistType: AssistType,
): AssistHistory {
  const usedAssistTypes = getUsedAssistTypes(
    history,
    puzzleId,
  )

  if (usedAssistTypes.includes(assistType)) {
    return history
  }

  return {
    ...history,
    [puzzleId]: [
      ...usedAssistTypes,
      assistType,
    ],
  }
}