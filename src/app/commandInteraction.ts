import type { PuzzleDefinition } from '../domain/puzzle'
import type { RuntimeState } from '../domain/runtimeState'

export type CommandInput = 'mouse' | 'touch'

// Preview is UI state, scoped to the exact puzzle and attempt that selected it.
export type CommandPreview = {
  cardId: string
  input: CommandInput
  puzzle: PuzzleDefinition
  runtime: RuntimeState
}

export const TAP_MOVE_TOLERANCE = 10

export function hasPointerMoved(
  startX: number,
  startY: number,
  x: number,
  y: number,
): boolean {
  return Math.hypot(x - startX, y - startY) > TAP_MOVE_TOLERANCE
}

export function resolveCommandInput(
  pointerType: string,
  canHover: boolean,
  coarsePointer: boolean,
  hasTouch: boolean,
): CommandInput {
  // Actual input takes precedence on hybrid devices and in landscape.
  if (pointerType === 'mouse') return 'mouse'
  if (pointerType === 'touch' || pointerType === 'pen') return 'touch'
  return coarsePointer || (!canHover && hasTouch) ? 'touch' : 'mouse'
}

export function resolveCommandClickInput(
  click: { detail: number; pointerType?: string },
  gesturePointerType: string | undefined,
  capabilities: { canHover: boolean; coarsePointer: boolean; hasTouch: boolean },
): CommandInput {
  // A zero click count is not proof of mouse/keyboard input. Prefer the actual
  // pointer-down source, including touch clicks reported as compatibility mouse events.
  return resolveCommandInput(
    gesturePointerType || click.pointerType || '',
    capabilities.canHover,
    capabilities.coarsePointer,
    capabilities.hasTouch,
  )
}

export function getActiveCommandPreview(
  preview: CommandPreview | null,
  puzzle: PuzzleDefinition,
  runtime: RuntimeState,
  enabled: boolean,
): CommandPreview | null {
  if (
    !enabled ||
    preview?.puzzle !== puzzle ||
    preview.runtime !== runtime ||
    !runtime.remainingCards.some((card) => card.id === preview.cardId)
  ) {
    return null
  }
  return preview
}

export function getCommandActivation(
  preview: CommandPreview | null,
  puzzle: PuzzleDefinition,
  runtime: RuntimeState,
  cardId: string,
  input: CommandInput,
  enabled: boolean,
): 'NONE' | 'PREVIEW' | 'EXECUTE' {
  if (!enabled || !runtime.remainingCards.some((card) => card.id === cardId)) {
    return 'NONE'
  }
  const active = getActiveCommandPreview(preview, puzzle, runtime, enabled)
  return input === 'mouse' || (active?.input === 'touch' && active.cardId === cardId)
    ? 'EXECUTE'
    : 'PREVIEW'
}
