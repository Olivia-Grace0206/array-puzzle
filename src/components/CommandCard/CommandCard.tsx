import './CommandCard.css'
import type { CommandCard as CommandCardData } from '../../domain/commandCard'

type CommandCardProps = {
  card: CommandCardData
  disabled?: boolean
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
  onHoverStart,
  onHoverEnd,
  onExecute,
}: CommandCardProps) {
  return (
    <button
      type="button"
      className="command-card"
      disabled={disabled}
      onMouseEnter={() => onHoverStart?.(card.id)}
      onMouseLeave={() => onHoverEnd?.()}
      onClick={() => onExecute?.(card.id)}
    >
      {formatCommand(card)}
    </button>
  )
}