import type { CommandCard } from '../../domain/commandCard'
import type { PuzzleDefinition } from '../../domain/puzzle'

type FixedPuzzleInput = {
  id: string
  start: string[]
  target: string[]
  hand: CommandCard[]
  designSolutionCardIds: string[]
  orderHintStep?: number
}

export function swapCard(
  id: string,
  a: number,
  b: number,
): CommandCard {
  return {
    id,
    command: {
      type: 'SWAP',
      a,
      b,
    },
  }
}

export function reverseCard(
  id: string,
  l: number,
  r: number,
): CommandCard {
  return {
    id,
    command: {
      type: 'REVERSE',
      l,
      r,
    },
  }
}

export function rotateCard(
  id: string,
  l: number,
  r: number,
  k: number,
): CommandCard {
  return {
    id,
    command: {
      type: 'ROTATE',
      l,
      r,
      k,
    },
  }
}

export function moveCard(
  id: string,
  a: number,
  b: number,
): CommandCard {
  return {
    id,
    command: {
      type: 'MOVE',
      a,
      b,
    },
  }
}

export function createFixedPuzzle({
  id,
  start,
  target,
  hand,
  designSolutionCardIds,
  orderHintStep,
}: FixedPuzzleInput): PuzzleDefinition {
  const designSolution =
    designSolutionCardIds.map((cardId) => {
      const card = hand.find(
        (candidate) =>
          candidate.id === cardId,
      )

      if (!card) {
        throw new Error(
          `${id}: Design Solution Card ID「${cardId}」がHANDに存在しません。`,
        )
      }

      return card.command
    })

  const orderHintCardId =
    orderHintStep === undefined
      ? undefined
      : designSolutionCardIds[
          orderHintStep - 1
        ]

  if (
    orderHintStep !== undefined &&
    orderHintCardId === undefined
  ) {
    throw new Error(
      `${id}: ORDER CHECKのStepがDesign Solutionの範囲外です。`,
    )
  }

  return {
    id,
    start,
    target,
    hand,
    designSolution,
    designSolutionCardIds,
    designSteps: designSolution.length,
    ...(orderHintStep !== undefined &&
    orderHintCardId !== undefined
      ? {
          assistConfig: {
            orderHint: {
              cardId: orderHintCardId,
              step: orderHintStep,
            },
          },
        }
      : {}),
  }
}