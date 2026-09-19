import type { Command } from '../../domain/command'
import type { PuzzleDefinition } from '../../domain/puzzle'
import { applyCommand } from '../commands/applyCommand'

export type PuzzleValidationIssueCode =
  | 'EMPTY_PUZZLE_ID'
  | 'EMPTY_START'
  | 'ARRAY_LENGTH_MISMATCH'
  | 'ARRAY_VALUES_MISMATCH'
  | 'START_EQUALS_TARGET'
  | 'EMPTY_HAND'
  | 'DUPLICATE_HAND_CARD_ID'
  | 'EMPTY_DESIGN_SOLUTION'
  | 'DESIGN_STEPS_MISMATCH'
  | 'DESIGN_CARD_IDS_LENGTH_MISMATCH'
  | 'DUPLICATE_DESIGN_CARD_ID'
  | 'DESIGN_CARD_NOT_FOUND'
  | 'DESIGN_COMMAND_MISMATCH'
  | 'HAND_COMMAND_OUT_OF_RANGE'
  | 'DESIGN_COMMAND_OUT_OF_RANGE'
  | 'TARGET_NOT_REACHED'
  | 'ORDER_HINT_STEP_INVALID'
  | 'ORDER_HINT_CARD_NOT_FOUND'
  | 'ORDER_HINT_CARD_MISMATCH'

export type PuzzleValidationIssue = {
  code: PuzzleValidationIssueCode
  message: string
}

export type PuzzleValidationResult = {
  isValid: boolean
  issues: PuzzleValidationIssue[]
}

function areArraysEqual<T>(
  first: readonly T[],
  second: readonly T[],
): boolean {
  if (first.length !== second.length) {
    return false
  }

  return first.every(
    (value, index) => value === second[index],
  )
}

function haveSameValues(
  first: readonly string[],
  second: readonly string[],
): boolean {
  if (first.length !== second.length) {
    return false
  }

  const valueCounts = new Map<string, number>()

  for (const value of first) {
    valueCounts.set(
      value,
      (valueCounts.get(value) ?? 0) + 1,
    )
  }

  for (const value of second) {
    const count = valueCounts.get(value) ?? 0

    if (count === 0) {
      return false
    }

    valueCounts.set(value, count - 1)
  }

  return [...valueCounts.values()].every(
    (count) => count === 0,
  )
}

function areCommandsEqual(
  first: Command,
  second: Command,
): boolean {
  if (first.type !== second.type) {
    return false
  }

  switch (first.type) {
    case 'SWAP':
      return (
        second.type === 'SWAP' &&
        first.a === second.a &&
        first.b === second.b
      )

    case 'REVERSE':
      return (
        second.type === 'REVERSE' &&
        first.l === second.l &&
        first.r === second.r
      )

    case 'ROTATE':
      return (
        second.type === 'ROTATE' &&
        first.l === second.l &&
        first.r === second.r &&
        first.k === second.k
      )

    case 'MOVE':
      return (
        second.type === 'MOVE' &&
        first.a === second.a &&
        first.b === second.b
      )
  }
}

function isValidIndex(
  index: number,
  arrayLength: number,
): boolean {
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < arrayLength
  )
}

function isCommandInRange(
  command: Command,
  arrayLength: number,
): boolean {
  switch (command.type) {
    case 'SWAP':
    case 'MOVE':
      return (
        isValidIndex(command.a, arrayLength) &&
        isValidIndex(command.b, arrayLength)
      )

    case 'REVERSE':
      return (
        isValidIndex(command.l, arrayLength) &&
        isValidIndex(command.r, arrayLength) &&
        command.l <= command.r
      )

    case 'ROTATE':
      return (
        isValidIndex(command.l, arrayLength) &&
        isValidIndex(command.r, arrayLength) &&
        command.l <= command.r &&
        Number.isInteger(command.k)
      )
  }
}

export function validatePuzzleDefinition(
  puzzle: PuzzleDefinition,
): PuzzleValidationResult {
  const issues: PuzzleValidationIssue[] = []

  function addIssue(
    code: PuzzleValidationIssueCode,
    message: string,
  ) {
    issues.push({
      code,
      message,
    })
  }

  if (puzzle.id.trim().length === 0) {
    addIssue(
      'EMPTY_PUZZLE_ID',
      'Puzzle IDが空です。',
    )
  }

  if (puzzle.start.length === 0) {
    addIssue(
      'EMPTY_START',
      `${puzzle.id}: STARTが空です。`,
    )
  }

  if (puzzle.start.length !== puzzle.target.length) {
    addIssue(
      'ARRAY_LENGTH_MISMATCH',
      `${puzzle.id}: STARTとTARGETの長さが一致しません。`,
    )
  }

  if (!haveSameValues(puzzle.start, puzzle.target)) {
    addIssue(
      'ARRAY_VALUES_MISMATCH',
      `${puzzle.id}: STARTとTARGETの要素構成が一致しません。`,
    )
  }

  if (areArraysEqual(puzzle.start, puzzle.target)) {
    addIssue(
      'START_EQUALS_TARGET',
      `${puzzle.id}: STARTとTARGETが同一です。`,
    )
  }

  if (puzzle.hand.length === 0) {
    addIssue(
      'EMPTY_HAND',
      `${puzzle.id}: HANDが空です。`,
    )
  }

  const handCardIds = new Set<string>()

  for (const card of puzzle.hand) {
    if (handCardIds.has(card.id)) {
      addIssue(
        'DUPLICATE_HAND_CARD_ID',
        `${puzzle.id}: HAND内でCard ID「${card.id}」が重複しています。`,
      )
    }

    handCardIds.add(card.id)

    if (
      !isCommandInRange(
        card.command,
        puzzle.start.length,
      )
    ) {
      addIssue(
        'HAND_COMMAND_OUT_OF_RANGE',
        `${puzzle.id}: Card ID「${card.id}」のCommandが範囲外です。`,
      )
    }
  }

  if (puzzle.designSolution.length === 0) {
    addIssue(
      'EMPTY_DESIGN_SOLUTION',
      `${puzzle.id}: Design Solutionが空です。`,
    )
  }

  if (
    puzzle.designSteps !== puzzle.designSolution.length
  ) {
    addIssue(
      'DESIGN_STEPS_MISMATCH',
      `${puzzle.id}: designStepsとDesign Solutionの長さが一致しません。`,
    )
  }

  if (
    puzzle.designSolutionCardIds.length !==
    puzzle.designSolution.length
  ) {
    addIssue(
      'DESIGN_CARD_IDS_LENGTH_MISMATCH',
      `${puzzle.id}: Design Solution Card ID列とDesign Solutionの長さが一致しません。`,
    )
  }

  const usedDesignCardIds = new Set<string>()

  for (
    let index = 0;
    index < puzzle.designSolutionCardIds.length;
    index += 1
  ) {
    const cardId = puzzle.designSolutionCardIds[index]

    if (usedDesignCardIds.has(cardId)) {
      addIssue(
        'DUPLICATE_DESIGN_CARD_ID',
        `${puzzle.id}: Design SolutionでCard ID「${cardId}」を複数回使用しています。`,
      )
    }

    usedDesignCardIds.add(cardId)

    const card = puzzle.hand.find(
      (candidate) => candidate.id === cardId,
    )

    if (!card) {
      addIssue(
        'DESIGN_CARD_NOT_FOUND',
        `${puzzle.id}: Design SolutionのCard ID「${cardId}」がHANDに存在しません。`,
      )

      continue
    }

    const designCommand = puzzle.designSolution[index]

    if (
      designCommand &&
      !areCommandsEqual(card.command, designCommand)
    ) {
      addIssue(
        'DESIGN_COMMAND_MISMATCH',
        `${puzzle.id}: Step ${index + 1}のCard IDとCommandが一致しません。`,
      )
    }
  }

  let canApplyDesignSolution = true

  for (
    let index = 0;
    index < puzzle.designSolution.length;
    index += 1
  ) {
    const command = puzzle.designSolution[index]

    if (
      !isCommandInRange(
        command,
        puzzle.start.length,
      )
    ) {
      canApplyDesignSolution = false

      addIssue(
        'DESIGN_COMMAND_OUT_OF_RANGE',
        `${puzzle.id}: Design SolutionのStep ${index + 1}が範囲外です。`,
      )
    }
  }

  if (canApplyDesignSolution) {
    const designResult = puzzle.designSolution.reduce(
      (currentArray, command) =>
        applyCommand(currentArray, command),
      [...puzzle.start],
    )

    if (!areArraysEqual(designResult, puzzle.target)) {
      addIssue(
        'TARGET_NOT_REACHED',
        `${puzzle.id}: Design Solutionを実行してもTARGETに到達しません。`,
      )
    }
  }

  const orderHint = puzzle.assistConfig?.orderHint

  if (orderHint) {
    const isStepValid =
      Number.isInteger(orderHint.step) &&
      orderHint.step >= 2 &&
      orderHint.step <= puzzle.designSolution.length

    if (!isStepValid) {
      addIssue(
        'ORDER_HINT_STEP_INVALID',
        `${puzzle.id}: ORDER CHECKのStepが有効範囲外です。`,
      )
    }

    const orderHintCard = puzzle.hand.find(
      (card) => card.id === orderHint.cardId,
    )

    if (!orderHintCard) {
      addIssue(
        'ORDER_HINT_CARD_NOT_FOUND',
        `${puzzle.id}: ORDER CHECKのCard IDがHANDに存在しません。`,
      )
    }

    if (
      isStepValid &&
      puzzle.designSolutionCardIds[
        orderHint.step - 1
      ] !== orderHint.cardId
    ) {
      addIssue(
        'ORDER_HINT_CARD_MISMATCH',
        `${puzzle.id}: ORDER CHECKのCard IDが指定StepのDesign Solution Card IDと一致しません。`,
      )
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}