import type { PuzzleDefinition } from '../../domain/puzzle'

export const veryEasyPuzzles: PuzzleDefinition[] = [
  {
    id: 'VE-1',

    start: ['A', 'B', 'C', 'D', 'E'],

    target: ['A', 'D', 'C', 'B', 'E'],

    hand: [
      {
        id: 've-1-card-1',
        command: {
          type: 'SWAP',
          a: 1,
          b: 3,
        },
      },
    ],

    designSolution: [
      {
        type: 'SWAP',
        a: 1,
        b: 3,
      },
    ],
  },

  {
    id: 'VE-2',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'D', 'E', 'B', 'C', 'F'],

    hand: [
      {
        id: 've-2-card-1',
        command: {
          type: 'MOVE',
          a: 3,
          b: 1,
        },
      },
      {
        id: 've-2-card-2',
        command: {
          type: 'MOVE',
          a: 4,
          b: 2,
        },
      },
    ],

    designSolution: [
      {
        type: 'MOVE',
        a: 3,
        b: 1,
      },
      {
        type: 'MOVE',
        a: 4,
        b: 2,
      },
    ],
  },
]