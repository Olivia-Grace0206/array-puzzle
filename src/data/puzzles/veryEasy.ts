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

    designSteps: 1,
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

    assistConfig: {
        orderHint: {
            cardId: 've-2-card-2',
            step: 2,
        },
    },

    designSteps: 2,
  },

  {
    id: 'VE-3',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'E', 'D', 'C', 'B', 'F'],

    hand: [
      {
        id: 've-3-card-1',
        command: {
          type: 'REVERSE',
          l: 1,
          r: 4,
        },
      },
    ],

    designSolution: [
      {
        type: 'REVERSE',
        l: 1,
        r: 4,
      },
    ],

    designSteps: 1,
  },

    {
    id: 'VE-4',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'D', 'E', 'B', 'C', 'F'],

    hand: [
        {
        id: 've-4-card-1',
        command: {
            type: 'ROTATE',
            l: 1,
            r: 4,
            k: 2,
        },
        },
    ],

    designSolution: [
        {
        type: 'ROTATE',
        l: 1,
        r: 4,
        k: 2,
        },
    ],

    designSteps: 1,
    },
    {
    id: 'VE-5',

    start: ['A', 'B', 'C', 'D', 'E', 'F'],

    target: ['A', 'E', 'B', 'D', 'C', 'F'],

    hand: [
        {
        id: 've-5-card-1',
        command: {
            type: 'SWAP',
            a: 1,
            b: 4,
        },
        },
        {
        id: 've-5-card-2',
        command: {
            type: 'REVERSE',
            l: 2,
            r: 4,
        },
        },
    ],

    designSolution: [
        {
        type: 'SWAP',
        a: 1,
        b: 4,
        },
        {
        type: 'REVERSE',
        l: 2,
        r: 4,
        },
    ],
    assistConfig: {
        orderHint: {
            cardId: 've-5-card-2',
        step: 2,
        },
    },
    designSteps: 2,
    },
]