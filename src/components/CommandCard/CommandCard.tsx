import './CommandCard.css'
import type { CommandCard as CommandCardData } from '../../domain/commandCard'

type CommandCardProps = {
  card: CommandCardData
  disabled?: boolean
  isExcludedByUseCheck?: boolean
  orderHintStep?: number
  isNextMoveHint?: boolean
  onHoverStart?: (cardId: string) => void
  onHoverEnd?: () => void
  onExecute?: (cardId: string) => void
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
  onHoverStart,
  onHoverEnd,
  onExecute,
}: CommandCardProps) {
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
      onMouseEnter={() =>
        onHoverStart?.(card.id)
      }
      onMouseLeave={() => onHoverEnd?.()}
      onClick={() => onExecute?.(card.id)}
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