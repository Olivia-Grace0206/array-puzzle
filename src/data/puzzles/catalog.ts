import type { PuzzleDefinition } from '../../domain/puzzle'
import { easyPuzzles } from './easy'
import { hardPuzzles } from './hard'
import { normalPuzzles } from './normal'
import { veryEasyPuzzles } from './veryEasy'
import { veryHardPuzzles } from './veryHard'

export const fixedPuzzles: PuzzleDefinition[] = [
  ...veryEasyPuzzles,
  ...easyPuzzles,
  ...normalPuzzles,
  ...hardPuzzles,
  ...veryHardPuzzles,
]

export const difficultyOptions = [
  {
    id: 'VERY_EASY',
    label: 'VERY EASY',
    description:
      '基本Commandを覚えるチュートリアル',
    puzzles: veryEasyPuzzles,
    available: true,
  },
  {
    id: 'EASY',
    label: 'EASY',
    description:
      '複数のCommandを組み合わせる入門問題',
    puzzles: easyPuzzles,
    available: true,
  },
  {
    id: 'NORMAL',
    label: 'NORMAL',
    description:
      '選択と順序を本格的に考える問題',
    puzzles: normalPuzzles,
    available: true,
  },
  {
    id: 'HARD',
    label: 'HARD',
    description:
      '複雑な手順を見抜く上級問題',
    puzzles: hardPuzzles,
    available: true,
  },
  {
    id: 'VERY_HARD',
    label: 'VERY HARD',
    description:
      '最も難しい固定問題',
    puzzles: veryHardPuzzles,
    available: true,
  },
] as const

export type DifficultyId =
  (typeof difficultyOptions)[number]['id']