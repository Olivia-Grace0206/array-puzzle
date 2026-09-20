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

function formatCommand(card: CommandCardData) {
  const command = card.command

  switch (command.type) {
    case 'SWAP':
      return `SWAP(${command.a}, ${command.b})`

    case 'REVERSE':
      return `REVERSE(${command.l}, ${command.r})`

    case 'ROTATE':
      return `ROTATE(${command.l}, ${command.r}, ${command.k})`

    case 'MOVE':
      return `MOVE(${command.a}, ${command.b})`
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
  const className = [
    'command-card',
    isExcludedByUseCheck
      ? 'command-card-use-check'
      : '',
    isNextMoveHint
      ? 'command-card-next-move'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onMouseEnter={() =>
        onHoverStart?.(card.id)
      }
      onMouseLeave={() => onHoverEnd?.()}
      onClick={() => onExecute?.(card.id)}
    >
      {orderHintStep !== undefined && (
        <span className="command-card-order-hint">
          {orderHintStep}
        </span>
      )}

      <span>{formatCommand(card)}</span>

      {(isExcludedByUseCheck ||
        isNextMoveHint) && (
        <span className="command-card-assist-labels">
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
      )}
    </button>
  )
}