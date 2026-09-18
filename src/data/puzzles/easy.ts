import type { PuzzleDefinition } from '../../domain/puzzle'

export const easyPuzzles: PuzzleDefinition[] = [
  {
    id: 'E-1',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'C', 'F', 'D', 'E', 'B'],

    hand: [
      {
        id: 'e-1-card-1',
        command: {
          type: 'REVERSE',
          l: 1,
          r: 4,
        },
      },
      {
        id: 'e-1-card-2',
        command: {
          type: 'MOVE',
          a: 5,
          b: 2,
        },
      },
      {
        id: 'e-1-card-3',
        command: {
          type: 'SWAP',
          a: 1,
          b: 4,
        },
      },
      {
        id: 'e-1-card-4',
        command: {
          type: 'SWAP',
          a: 0,
          b: 5,
        },
      },
      {
        id: 'e-1-card-5',
        command: {
          type: 'REVERSE',
          l: 0,
          r: 2,
        },
      },
    ],

    designSolution: [
      {
        type: 'REVERSE',
        l: 1,
        r: 4,
      },
      {
        type: 'MOVE',
        a: 5,
        b: 2,
      },
      {
        type: 'SWAP',
        a: 1,
        b: 4,
      },
    ],

    assistConfig: {
        orderHint: {
            cardId: 'e-1-card-3',
            step: 3,
        },
    },

    designSteps: 3,
  },
]