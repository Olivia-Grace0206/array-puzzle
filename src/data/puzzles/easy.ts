import type { PuzzleDefinition } from '../../domain/puzzle'
import {
  createFixedPuzzle,
  moveCard,
  reverseCard,
  rotateCard,
  swapCard,
} from './fixedPuzzleFactory'

export const easyPuzzles: PuzzleDefinition[] = [
  createFixedPuzzle({
    id: 'E-1',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'C', 'F', 'D', 'E', 'B'],

    hand: [
      reverseCard('e-1-card-1', 1, 4),
      moveCard('e-1-card-2', 5, 2),
      swapCard('e-1-card-3', 1, 4),
      swapCard('e-1-card-4', 0, 5),
      reverseCard('e-1-card-5', 0, 2),
    ],

    designSolutionCardIds: [
      'e-1-card-1',
      'e-1-card-2',
      'e-1-card-3',
    ],

    orderHintStep: 3,
  }),

  createFixedPuzzle({
    id: 'E-2',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'C', 'F', 'E', 'D', 'B'],

    hand: [
      moveCard('e-2-card-1', 4, 1),
      swapCard('e-2-card-2', 2, 5),
      reverseCard('e-2-card-3', 1, 3),
      rotateCard('e-2-card-4', 1, 4, 1),
      swapCard('e-2-card-5', 0, 5),
    ],

    designSolutionCardIds: [
      'e-2-card-1',
      'e-2-card-2',
      'e-2-card-3',
    ],

    orderHintStep: 2,
  }),

  createFixedPuzzle({
    id: 'E-3',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'B', 'D', 'E', 'C', 'F'],

    hand: [
      rotateCard('e-3-card-1', 1, 4, 1),
      moveCard('e-3-card-2', 4, 2),
      swapCard('e-3-card-3', 1, 3),
      reverseCard('e-3-card-4', 1, 4),
      moveCard('e-3-card-5', 5, 1),
    ],

    designSolutionCardIds: [
      'e-3-card-1',
      'e-3-card-2',
      'e-3-card-3',
    ],

    orderHintStep: 3,
  }),

  createFixedPuzzle({
    id: 'E-4',

    start: [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ],

    target: [
      'A',
      'D',
      'B',
      'C',
      'F',
      'E',
      'G',
    ],

    hand: [
      reverseCard('e-4-card-1', 1, 5),
      rotateCard('e-4-card-2', 2, 5, 2),
      moveCard('e-4-card-3', 5, 1),
      swapCard('e-4-card-4', 2, 4),
      reverseCard('e-4-card-5', 0, 3),
      moveCard('e-4-card-6', 1, 5),
    ],

    designSolutionCardIds: [
      'e-4-card-1',
      'e-4-card-2',
      'e-4-card-3',
      'e-4-card-4',
    ],

    orderHintStep: 3,
  }),

  createFixedPuzzle({
    id: 'E-5',

    start: [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ],

    target: [
      'A',
      'E',
      'D',
      'F',
      'G',
      'B',
      'C',
    ],

    hand: [
      moveCard('e-5-card-1', 6, 1),
      reverseCard('e-5-card-2', 2, 5),
      rotateCard('e-5-card-3', 1, 4, -1),
      swapCard('e-5-card-4', 3, 6),
      swapCard('e-5-card-5', 1, 5),
      rotateCard('e-5-card-6', 0, 6, 1),
    ],

    designSolutionCardIds: [
      'e-5-card-1',
      'e-5-card-2',
      'e-5-card-3',
      'e-5-card-4',
    ],

    orderHintStep: 4,
  }),
]