import type {
  AssistHistory,
  AssistType,
  PuzzleAssistState,
} from '../../domain/assist'

const EMPTY_PUZZLE_ASSIST_STATE: PuzzleAssistState = {
  usedAssistTypes: [],
}

export function createAssistHistory(): AssistHistory {
  return {}
}

export function getPuzzleAssistState(
  history: AssistHistory,
  puzzleId: string,
): PuzzleAssistState {
  return (
    history[puzzleId] ??
    EMPTY_PUZZLE_ASSIST_STATE
  )
}

export function getUsedAssistTypes(
  history: AssistHistory,
  puzzleId: string,
): readonly AssistType[] {
  return getPuzzleAssistState(
    history,
    puzzleId,
  ).usedAssistTypes
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
 * USE CHECKまたはORDER CHECKの使用を記録する。
 *
 * 同じAssistが使用済みの場合は、
 * 履歴を変更せず同じオブジェクトを返す。
 */
export function recordAssistUsage(
  history: AssistHistory,
  puzzleId: string,
  assistType: AssistType,
): AssistHistory {
  const currentState = getPuzzleAssistState(
    history,
    puzzleId,
  )

  if (
    currentState.usedAssistTypes.includes(
      assistType,
    )
  ) {
    return history
  }

  return {
    ...history,
    [puzzleId]: {
      ...currentState,
      usedAssistTypes: [
        ...currentState.usedAssistTypes,
        assistType,
      ],
    },
  }
}

/**
 * NEXT MOVEの使用と、その瞬間に開示したCard IDを記録する。
 *
 * NEXT MOVEがすでに使用済みの場合は、
 * 新しいCard IDへ上書きしない。
 */
export function recordNextMoveHint(
  history: AssistHistory,
  puzzleId: string,
  cardId: string,
): AssistHistory {
  const currentState = getPuzzleAssistState(
    history,
    puzzleId,
  )

  if (
    currentState.usedAssistTypes.includes(
      'NEXT_MOVE',
    )
  ) {
    return history
  }

  return {
    ...history,
    [puzzleId]: {
      ...currentState,
      usedAssistTypes: [
        ...currentState.usedAssistTypes,
        'NEXT_MOVE',
      ],
      nextMoveCardId: cardId,
    },
  }
}

export function getRecordedNextMoveCardId(
  history: AssistHistory,
  puzzleId: string,
): string | undefined {
  return getPuzzleAssistState(
    history,
    puzzleId,
  ).nextMoveCardId
}