import { describe, expect, it } from 'vitest'
import {
  getActiveCommandPreview,
  getCommandActivation,
  hasPointerMoved,
  resolveCommandInput,
  type CommandPreview,
} from '../src/app/commandInteraction'
import { executeCard } from '../src/core/executeCard'
import { getPreviewArray } from '../src/core/getPreviewArray'
import { veryEasyPuzzles } from '../src/data/puzzles/veryEasy'
import type { RuntimeState } from '../src/domain/runtimeState'

const puzzle = veryEasyPuzzles[1]
const [cardA, cardB] = puzzle.hand

function createAttempt(): RuntimeState {
  return {
    currentArray: [...puzzle.start],
    remainingCards: [...puzzle.hand],
    usedCards: [],
    moveCount: 0,
  }
}

function touchPreview(runtime: RuntimeState, cardId = cardA.id): CommandPreview {
  return { cardId, input: 'touch', puzzle, runtime }
}

describe('command input', () => {
  it('uses actual mouse input even on touch-capable or narrow devices', () => {
    expect(resolveCommandInput('mouse', false, true, true)).toBe('mouse')
  })

  it('uses actual touch input even with an attached mouse or in landscape', () => {
    expect(resolveCommandInput('touch', true, false, true)).toBe('touch')
  })

  it('treats a pen as deliberate two-stage selection', () => {
    expect(resolveCommandInput('pen', true, false, true)).toBe('touch')
  })

  it('falls back to capabilities when pointer type is unavailable', () => {
    expect(resolveCommandInput('', false, true, true)).toBe('touch')
    expect(resolveCommandInput('', false, false, true)).toBe('touch')
    expect(resolveCommandInput('', true, false, true)).toBe('mouse')
    expect(resolveCommandInput('', true, false, false)).toBe('mouse')
  })

  it('allows small tap jitter but identifies horizontal, vertical and diagonal swipes', () => {
    expect(hasPointerMoved(0, 0, 6, 6)).toBe(false)
    expect(hasPointerMoved(0, 0, 11, 0)).toBe(true)
    expect(hasPointerMoved(0, 0, 0, 11)).toBe(true)
    expect(hasPointerMoved(0, 0, 8, 8)).toBe(true)
  })
})

describe('two-stage command activation', () => {
  it('first touch previews without changing the array, hand or move count', () => {
    const runtime = createAttempt()
    const before = structuredClone(runtime)
    expect(getCommandActivation(null, puzzle, runtime, cardA.id, 'touch', true))
      .toBe('PREVIEW')
    expect(getPreviewArray(runtime, cardA.id)).not.toEqual(runtime.currentArray)
    expect(runtime).toEqual(before)
  })

  it('second touch on the same card executes through the existing core', () => {
    const runtime = createAttempt()
    const selected = touchPreview(runtime)
    expect(getCommandActivation(selected, puzzle, runtime, cardA.id, 'touch', true))
      .toBe('EXECUTE')
    const next = executeCard(runtime, cardA.id)
    expect(next.currentArray).toEqual(getPreviewArray(runtime, cardA.id))
    expect(next.moveCount).toBe(1)
    expect(next.usedCards.map((card) => card.id)).toEqual([cardA.id])
    expect(getActiveCommandPreview(selected, puzzle, next, true)).toBeNull()
  })

  it('switches from A to B without executing A, then executes B on its second touch', () => {
    const runtime = createAttempt()
    expect(getCommandActivation(touchPreview(runtime), puzzle, runtime, cardB.id, 'touch', true))
      .toBe('PREVIEW')
    expect(runtime.moveCount).toBe(0)
    expect(runtime.usedCards).toEqual([])
    expect(getCommandActivation(touchPreview(runtime, cardB.id), puzzle, runtime, cardB.id, 'touch', true))
      .toBe('EXECUTE')
  })

  it('does not treat a mouse hover as the first touch', () => {
    const runtime = createAttempt()
    const selected: CommandPreview = { ...touchPreview(runtime), input: 'mouse' }
    expect(getCommandActivation(selected, puzzle, runtime, cardA.id, 'touch', true))
      .toBe('PREVIEW')
  })

  it('executes mouse clicks immediately regardless of preview state', () => {
    const runtime = createAttempt()
    expect(getCommandActivation(null, puzzle, runtime, cardA.id, 'mouse', true))
      .toBe('EXECUTE')
    expect(getCommandActivation(touchPreview(runtime), puzzle, runtime, cardB.id, 'mouse', true))
      .toBe('EXECUTE')
  })

  it('rejects missing or already-used cards for both inputs', () => {
    const runtime = executeCard(createAttempt(), cardA.id)
    for (const input of ['mouse', 'touch'] as const) {
      expect(getCommandActivation(null, puzzle, runtime, cardA.id, input, true)).toBe('NONE')
      expect(getCommandActivation(null, puzzle, runtime, 'missing', input, true)).toBe('NONE')
    }
  })

  it('invalidates preview on puzzle changes even if a card ID is reused', () => {
    const runtime = createAttempt()
    const nextPuzzle = { ...puzzle, id: 'another-puzzle' }
    const selected = touchPreview(runtime)
    expect(getActiveCommandPreview(selected, nextPuzzle, runtime, true)).toBeNull()
    expect(getCommandActivation(selected, nextPuzzle, runtime, cardA.id, 'touch', true))
      .toBe('PREVIEW')
  })

  it('invalidates preview on restart and other runtime replacements', () => {
    const runtime = createAttempt()
    const restarted = createAttempt()
    expect(getActiveCommandPreview(touchPreview(runtime), puzzle, restarted, true)).toBeNull()
    expect(getCommandActivation(touchPreview(runtime), puzzle, restarted, cardA.id, 'touch', true))
      .toBe('PREVIEW')
  })

  it('disables preview and activation away from the puzzle, on clear, skip or modal', () => {
    const runtime = createAttempt()
    const selected = touchPreview(runtime)
    expect(getActiveCommandPreview(selected, puzzle, runtime, false)).toBeNull()
    expect(getCommandActivation(selected, puzzle, runtime, cardA.id, 'touch', false))
      .toBe('NONE')
  })
})
