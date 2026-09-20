import { describe, expect, it } from 'vitest'
import {
  createAssistHistory,
  getRecordedNextMoveCardId,
  getUsedAssistTypes,
  hasAssistBeenUsed,
  recordAssistUsage,
  recordNextMoveHint,
} from '../src/core/assist/assistHistory'

describe('assistHistory', () => {
  it('初期状態では使用済みAssistが存在しない', () => {
    const history = createAssistHistory()

    expect(
      getUsedAssistTypes(history, 'VE-1'),
    ).toEqual([])

    expect(
      getRecordedNextMoveCardId(
        history,
        'VE-1',
      ),
    ).toBeUndefined()
  })

  it('使用したAssistを問題単位で記録する', () => {
    const history = recordAssistUsage(
      createAssistHistory(),
      'VE-1',
      'USE_CHECK',
    )

    expect(
      getUsedAssistTypes(history, 'VE-1'),
    ).toEqual(['USE_CHECK'])

    expect(
      hasAssistBeenUsed(
        history,
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

  it('異なるAssistはそれぞれ記録する', () => {
    const afterUseCheck =
      recordAssistUsage(
        createAssistHistory(),
        'VE-1',
        'USE_CHECK',
      )

    const result = recordAssistUsage(
      afterUseCheck,
      'VE-1',
      'ORDER_CHECK',
    )

    expect(
      getUsedAssistTypes(result, 'VE-1'),
    ).toEqual([
      'USE_CHECK',
      'ORDER_CHECK',
    ])
  })

  it('問題ごとにAssist履歴を分離する', () => {
    const firstHistory =
      recordAssistUsage(
        createAssistHistory(),
        'VE-1',
        'USE_CHECK',
      )

    const result = recordAssistUsage(
      firstHistory,
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

  it('NEXT MOVEと開示したCard IDを同時に記録する', () => {
    const result = recordNextMoveHint(
      createAssistHistory(),
      'E-1',
      'e-1-card-2',
    )

    expect(
      getUsedAssistTypes(result, 'E-1'),
    ).toEqual(['NEXT_MOVE'])

    expect(
      getRecordedNextMoveCardId(
        result,
        'E-1',
      ),
    ).toBe('e-1-card-2')
  })

  it('NEXT MOVEを再使用しても開示Card IDを変更しない', () => {
    const history = recordNextMoveHint(
      createAssistHistory(),
      'E-1',
      'e-1-card-1',
    )

    const result = recordNextMoveHint(
      history,
      'E-1',
      'e-1-card-2',
    )

    expect(result).toBe(history)

    expect(
      getRecordedNextMoveCardId(
        result,
        'E-1',
      ),
    ).toBe('e-1-card-1')

    expect(
      getUsedAssistTypes(result, 'E-1'),
    ).toEqual(['NEXT_MOVE'])
  })

  it('問題を切り替えて戻っても履歴と開示結果を取得できる', () => {
    const history = recordNextMoveHint(
      createAssistHistory(),
      'VE-2',
      've-2-card-2',
    )

    expect(
      getUsedAssistTypes(history, 'E-1'),
    ).toEqual([])

    expect(
      getRecordedNextMoveCardId(
        history,
        'VE-2',
      ),
    ).toBe('ve-2-card-2')
  })
})