import { describe, expect, it } from 'vitest'
import { applyCommand } from '../src/core/commands/applyCommand'
import { veryEasyPuzzles } from '../src/data/puzzles/veryEasy'

describe('fixed puzzle design solutions', () => {
  for (const puzzle of veryEasyPuzzles) {
    it(`${puzzle.id} のDesign SolutionでTARGETに到達する`, () => {
      const result = puzzle.designSolution.reduce(
        (current, command) => applyCommand(current, command),
        [...puzzle.start],
      )

      expect(result).toEqual(puzzle.target)
    })
  }
})