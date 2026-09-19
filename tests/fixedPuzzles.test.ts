import { describe, expect, it } from 'vitest'
import { applyCommand } from '../src/core/commands/applyCommand'
import { validatePuzzleDefinition } from '../src/core/validation/validatePuzzleDefinition'
import { easyPuzzles } from '../src/data/puzzles/easy'
import { veryEasyPuzzles } from '../src/data/puzzles/veryEasy'

const fixedPuzzles = [
  ...veryEasyPuzzles,
  ...easyPuzzles,
]

describe('fixed puzzle validation', () => {
  for (const puzzle of fixedPuzzles) {
    it(`${puzzle.id} のPuzzleDefinitionが有効である`, () => {
      const result = validatePuzzleDefinition(puzzle)

      expect(result.issues).toEqual([])
      expect(result.isValid).toBe(true)
    })
  }
})

describe('fixed puzzle design solutions', () => {
  for (const puzzle of fixedPuzzles) {
    it(`${puzzle.id} のDesign SolutionでTARGETに到達する`, () => {
      const result = puzzle.designSolution.reduce(
        (current, command) =>
          applyCommand(current, command),
        [...puzzle.start],
      )

      expect(result).toEqual(puzzle.target)
    })

    it(`${puzzle.id} のDesign Solution Card IDがHANDと一致する`, () => {
      expect(puzzle.designSolutionCardIds).toHaveLength(
        puzzle.designSolution.length,
      )

      puzzle.designSolutionCardIds.forEach(
        (cardId, index) => {
          const card = puzzle.hand.find(
            (candidate) => candidate.id === cardId,
          )

          expect(card).toBeDefined()
          expect(card?.command).toEqual(
            puzzle.designSolution[index],
          )
        },
      )
    })
  }
})

describe('fixed puzzle assist metadata', () => {
  for (const puzzle of fixedPuzzles) {
    const orderHint = puzzle.assistConfig?.orderHint

    if (!orderHint) {
      continue
    }

    it(`${puzzle.id} のORDER CHECK設定がDesign Solutionと一致する`, () => {
      expect(orderHint.step).toBeGreaterThanOrEqual(2)
      expect(orderHint.step).toBeLessThanOrEqual(
        puzzle.designSolution.length,
      )

      expect(orderHint.cardId).toBe(
        puzzle.designSolutionCardIds[
          orderHint.step - 1
        ],
      )

      const card = puzzle.hand.find(
        (handCard) => handCard.id === orderHint.cardId,
      )

      expect(card).toBeDefined()
      expect(card?.command).toEqual(
        puzzle.designSolution[orderHint.step - 1],
      )
    })
  }
})