import './CommandCard.css'
import { useRef } from 'react'
import {
  hasPointerMoved,
  resolveCommandInput,
  type CommandInput,
} from '../../app/commandInteraction'
import type { CommandCard as CommandCardData } from '../../domain/commandCard'

type CommandCardProps = {
  card: CommandCardData
  disabled?: boolean
  isExcludedByUseCheck?: boolean
  orderHintStep?: number
  isNextMoveHint?: boolean
  isTouchPreview?: boolean
  onHoverStart?: (cardId: string) => void
  onHoverEnd?: () => void
  onActivate?: (cardId: string, input: CommandInput) => void
}

function formatParameters(
  card: CommandCardData,
): string {
  const command = card.command

  switch (command.type) {
    case 'SWAP':
      return `(${command.a}, ${command.b})`

    case 'REVERSE':
      return `(${command.l}, ${command.r})`

    case 'ROTATE':
      return `(${command.l}, ${command.r}, ${command.k})`

    case 'MOVE':
      return `(${command.a}, ${command.b})`
  }
}

export function CommandCard({
  card,
  disabled = false,
  isExcludedByUseCheck = false,
  orderHintStep,
  isNextMoveHint = false,
  isTouchPreview = false,
  onHoverStart,
  onHoverEnd,
  onActivate,
}: CommandCardProps) {
  const gesture = useRef<{
    pointerId: number
    pointerType: string
    x: number
    y: number
    cancelled: boolean
  } | null>(null)
  const commandType =
    card.command.type.toLowerCase()

  const className = [
    'command-card',
    `command-card-${commandType}`,
    isExcludedByUseCheck
      ? 'command-card-use-check'
      : '',
    isNextMoveHint
      ? 'command-card-next-move'
      : '',
    isTouchPreview ? 'command-card-touch-preview' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const accessibleName =
    `${card.command.type}${formatParameters(card)}`

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-label={accessibleName}
      aria-pressed={isTouchPreview}
      onPointerEnter={(event) => {
        if (!disabled && event.pointerType === 'mouse') onHoverStart?.(card.id)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') onHoverEnd?.()
      }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return
        gesture.current = {
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          x: event.clientX,
          y: event.clientY,
          cancelled: false,
        }
      }}
      onPointerMove={(event) => {
        const start = gesture.current
        if (start?.pointerId === event.pointerId &&
          hasPointerMoved(start.x, start.y, event.clientX, event.clientY)) {
          start.cancelled = true
        }
      }}
      onPointerUp={(event) => {
        const start = gesture.current
        if (start?.pointerId === event.pointerId &&
          hasPointerMoved(start.x, start.y, event.clientX, event.clientY)) {
          start.cancelled = true
        }
      }}
      onPointerCancel={() => {
        if (gesture.current) gesture.current.cancelled = true
      }}
      onClick={(event) => {
        if (disabled) return
        // Keyboard/assistive activation retains the usual single-click action.
        if (event.detail === 0) {
          gesture.current = null
          onActivate?.(card.id, 'mouse')
          return
        }
        const start = gesture.current
        gesture.current = null
        if (start?.cancelled) return
        const pointerType = (event.nativeEvent as PointerEvent).pointerType ||
          start?.pointerType || ''
        onActivate?.(card.id, resolveCommandInput(
          pointerType,
          window.matchMedia('(any-hover: hover)').matches,
          window.matchMedia('(pointer: coarse)').matches,
          navigator.maxTouchPoints > 0,
        ))
      }}
    >
      <span className="command-card-accent" />

      {orderHintStep !== undefined && (
        <span className="command-card-order-hint">
          {orderHintStep}
        </span>
      )}

      <span className="command-card-kicker">
        COMMAND
      </span>

      <span className="command-card-type">
        {card.command.type}
      </span>

      <span className="command-card-parameters">
        {formatParameters(card)}
      </span>

      <span className="command-card-assist-area">
        {isExcludedByUseCheck && (
          <span className="command-card-assist-label command-card-assist-label-unused">
            NOT USED
          </span>
        )}

        {isNextMoveHint && (
          <span className="command-card-assist-label command-card-assist-label-next">
            NEXT
          </span>
        )}
      </span>
    </button>
  )
}
