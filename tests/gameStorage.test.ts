import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  GAME_STORAGE_KEY,
  createEmptyGameSave,
  loadGameSave,
  saveGameSave,
} from '../src/core/persistence/gameStorage'
import type { GameStorage } from '../src/core/persistence/gameStorage'

class MemoryStorage implements GameStorage {
  private readonly values =
    new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(
    key: string,
    value: string,
  ): void {
    this.values.set(key, value)
  }
}

describe('gameStorage', () => {
  it('保存データがない場合は空のデータを返す', () => {
    const storage = new MemoryStorage()

    expect(loadGameSave(storage)).toEqual(
      createEmptyGameSave(),
    )
  })

  it('ゲームデータを保存して読み込める', () => {
    const storage = new MemoryStorage()

    const gameSave = {
      version: 1 as const,
      assistHistory: {
        'VE-1': {
          usedAssistTypes: [
            'USE_CHECK' as const,
          ],
        },
      },
      handOrderHistory: {
        'VE-1': [
          've-1-card-1',
        ],
      },
      progressHistory: {
        'VE-1': {
          status: 'CLEARED' as const,
          bestStars: 2,
        },
      },
    }

    expect(
      saveGameSave(storage, gameSave),
    ).toBe(true)

    expect(
      loadGameSave(storage),
    ).toEqual(gameSave)
  })

  it('壊れたJSONは空のデータとして扱う', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      GAME_STORAGE_KEY,
      '{broken-json',
    )

    expect(loadGameSave(storage)).toEqual(
      createEmptyGameSave(),
    )
  })

  it('Versionが異なるデータは読み込まない', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        assistHistory: {},
        handOrderHistory: {},
        progressHistory: {},
      }),
    )

    expect(loadGameSave(storage)).toEqual(
      createEmptyGameSave(),
    )
  })

  it('不正なStarsを含むデータは読み込まない', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        assistHistory: {},
        handOrderHistory: {},
        progressHistory: {
          'VE-1': {
            status: 'CLEARED',
            bestStars: 10,
          },
        },
      }),
    )

    expect(loadGameSave(storage)).toEqual(
      createEmptyGameSave(),
    )
  })

  it('不正なAssist種類を含むデータは読み込まない', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        assistHistory: {
          'VE-1': {
            usedAssistTypes: [
              'UNKNOWN_ASSIST',
            ],
          },
        },
        handOrderHistory: {},
        progressHistory: {},
      }),
    )

    expect(loadGameSave(storage)).toEqual(
      createEmptyGameSave(),
    )
  })
})