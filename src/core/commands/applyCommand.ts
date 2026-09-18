import type { Command } from '../../domain/command'
import { move } from './move'
import { reverse } from './reverse'
import { rotate } from './rotate'
import { swap } from './swap'

export function applyCommand<T>(
  array: readonly T[],
  command: Command,
): T[] {
  switch (command.type) {
    case 'SWAP':
      return swap(array, command.a, command.b)

    case 'REVERSE':
      return reverse(array, command.l, command.r)

    case 'ROTATE':
      return rotate(array, command.l, command.r, command.k)

    case 'MOVE':
      return move(array, command.a, command.b)
  }
}