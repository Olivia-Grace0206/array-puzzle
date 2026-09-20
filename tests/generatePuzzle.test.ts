import {
  describe,
  expect,
  it,
} from 'vitest'
import { applyCommand } from '../src/core/commands/applyCommand'
import {
  GENERATOR_DIFFICULTIES,
  createRandomSeed,
  generatePuzzle,
  getGeneratorPreset,
} from '../src/core/generator/generatePuzzle'
import { validatePuzzleDefinition } from '../src/core/validation/validatePuzzleDefinition'

describe('generatePuzzle', () => {
  it('同じSeedと難易度から同じ問題を生成する', () => {
    const first = generatePuzzle({
      difficulty: 'NORMAL',
      seed: 12345,
    })

    const second = generatePuzzle({
      difficulty: 'NORMAL',
      seed: 12345,
    })

    expect(first).toEqual(second)
  })

  it('異なるSeedから異なる問題を生成する', () => {
    const first = generatePuzzle({
      difficulty: 'NORMAL',
      seed: 12345,
    })

    const second = generatePuzzle({
      difficulty: 'NORMAL',
      seed: 67890,
    })

    expect(second).not.toEqual(first)
  })

  it.each(GENERATOR_DIFFICULTIES)(
    '%sの設定どおりに問題を生成する',
    (difficulty) => {
      const preset =
        getGeneratorPreset(difficulty)

      const puzzle = generatePuzzle({
        difficulty,
        seed: 24680,
      })

      expect(puzzle.start).toHaveLength(
        preset.arrayLength,
      )

      expect(
        puzzle.designSolution,
      ).toHaveLength(
        preset.designSteps,
      )

      expect(puzzle.hand).toHaveLength(
        preset.designSteps +
          preset.extraCardCount,
      )
    },
  )

  it.each(GENERATOR_DIFFICULTIES)(
    '%sで生成した100問がすべて有効である',
    (difficulty) => {
      for (
        let seed = 1;
        seed <= 100;
        seed += 1
      ) {
        const puzzle =
          generatePuzzle({
            difficulty,
            seed,
          })

        const validation =
          validatePuzzleDefinition(
            puzzle,
          )

        expect(
          validation.issues,
          `${puzzle.id}の検証結果`,
        ).toEqual([])

        expect(
          validation.isValid,
        ).toBe(true)
      }
    },
  )

  it.each(GENERATOR_DIFFICULTIES)(
    '%sのDesign Solutionで必ずTARGETへ到達する',
    (difficulty) => {
      for (
        let seed = 101;
        seed <= 150;
        seed += 1
      ) {
        const puzzle =
          generatePuzzle({
            difficulty,
            seed,
          })

        const result =
          puzzle.designSolution.reduce(
            (current, command) =>
              applyCommand(
                current,
                command,
              ),
            [...puzzle.start],
          )

        expect(
          result,
          puzzle.id,
        ).toEqual(puzzle.target)
      }
    },
  )

  it('全カードの変換結果が重複しない', () => {
    for (
      let seed = 1;
      seed <= 100;
      seed += 1
    ) {
      const puzzle =
        generatePuzzle({
          difficulty: 'VERY_HARD',
          seed,
        })

      const cardResults =
        puzzle.hand.map((card) =>
          JSON.stringify(
            applyCommand(
              puzzle.start,
              card.command,
            ),
          ),
        )

      expect(
        new Set(cardResults).size,
        puzzle.id,
      ).toBe(cardResults.length)
    }
  })

  it('ORDER CHECKがDesign Solutionの2手目以降を指す', () => {
    const puzzle = generatePuzzle({
      difficulty: 'HARD',
      seed: 555,
    })

    const orderHint =
      puzzle.assistConfig?.orderHint

    expect(orderHint).toBeDefined()
    expect(
      orderHint?.step,
    ).toBeGreaterThanOrEqual(2)

    expect(orderHint?.cardId).toBe(
      puzzle.designSolutionCardIds[
        (orderHint?.step ?? 1) - 1
      ],
    )
  })

  it('画面用Seedを指定範囲内で生成する', () => {
    expect(
      createRandomSeed(() => 0),
    ).toBe(1)

    expect(
      createRandomSeed(
        () => 0.999999999,
      ),
    ).toBeLessThanOrEqual(
      999_999_999,
    )
  })
})