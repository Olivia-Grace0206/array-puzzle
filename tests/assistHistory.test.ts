import { describe, expect, it } from 'vitest'
import {
  createAssistHistory,
  getUsedAssistTypes,
  hasAssistBeenUsed,
  recordAssistUsage,
} from '../src/core/assist/assistHistory'

describe('assistHistory', () => {
  it('初期状態では使用済みAssistが存在しない', () => {
    const history = createAssistHistory()

    expect(
      getUsedAssistTypes(history, 'VE-1'),
    ).toEqual([])

    expect(
      hasAssistBeenUsed(
        history,
        'VE-1',
        'USE_CHECK',
      ),
    ).toBe(false)
  })

  it('使用したAssistを問題単位で記録する', () => {
    const history = createAssistHistory()

    const result = recordAssistUsage(
      history,
      'VE-1',
      'USE_CHECK',
    )

    expect(
      getUsedAssistTypes(result, 'VE-1'),
    ).toEqual(['USE_CHECK'])

    expect(
      hasAssistBeenUsed(
        result,
        'VE-1',
        'USE_CHECK',
      ),
    ).toBe(true)
  })

  it('同じAssistを複数回記録しない', () => {
    const history = recordAssistUsage(
      createAssistHistory(),
      'VE-1',
      'USE_CHECK',
    )

    const result = recordAssistUsage(
      history,
      'VE-1',
      'USE_CHECK',
    )

    expect(result).toBe(history)

    expect(
      getUsedAssistTypes(result, 'VE-1'),
    ).toEqual(['USE_CHECK'])
  })

  it('異なるAssistはそれぞれ1回ずつ記録する', () => {
    const afterUseCheck = recordAssistUsage(
      createAssistHistory(),
      'VE-1',
      'USE_CHECK',
    )

    const afterOrderCheck = recordAssistUsage(
      afterUseCheck,
      'VE-1',
      'ORDER_CHECK',
    )

    const result = recordAssistUsage(
      afterOrderCheck,
      'VE-1',
      'NEXT_MOVE',
    )

    expect(
      getUsedAssistTypes(result, 'VE-1'),
    ).toEqual([
      'USE_CHECK',
      'ORDER_CHECK',
      'NEXT_MOVE',
    ])
  })

  it('問題ごとにAssist履歴を分離する', () => {
    const afterVeryEasyAssist =
      recordAssistUsage(
        createAssistHistory(),
        'VE-1',
        'USE_CHECK',
      )

    const result = recordAssistUsage(
      afterVeryEasyAssist,
      'E-1',
      'ORDER_CHECK',
    )

    expect(
      getUsedAssistTypes(result, 'VE-1'),
    ).toEqual(['USE_CHECK'])

    expect(
      getUsedAssistTypes(result, 'E-1'),
    ).toEqual(['ORDER_CHECK'])
  })

  it('元のAssist履歴を変更しない', () => {
    const original = createAssistHistory()

    const result = recordAssistUsage(
      original,
      'VE-1',
      'USE_CHECK',
    )

    expect(
      getUsedAssistTypes(original, 'VE-1'),
    ).toEqual([])

    expect(
      getUsedAssistTypes(result, 'VE-1'),
    ).toEqual(['USE_CHECK'])

    expect(result).not.toBe(original)
  })

  it('別の問題を確認した後に戻っても履歴を取得できる', () => {
    const history = recordAssistUsage(
      createAssistHistory(),
      'VE-1',
      'NEXT_MOVE',
    )

    expect(
      getUsedAssistTypes(history, 'E-1'),
    ).toEqual([])

    expect(
      getUsedAssistTypes(history, 'VE-1'),
    ).toEqual(['NEXT_MOVE'])
  })

  it('Assist履歴は盤面のRestart対象と独立している', () => {
    const history = recordAssistUsage(
      createAssistHistory(),
      'VE-1',
      'ORDER_CHECK',
    )

    const restartedCurrentArray = [
      'A',
      'B',
      'C',
      'D',
      'E',
    ]

    expect(restartedCurrentArray).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
    ])

    expect(
      getUsedAssistTypes(history, 'VE-1'),
    ).toEqual(['ORDER_CHECK'])
  })
})