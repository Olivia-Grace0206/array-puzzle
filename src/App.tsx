import {
  useEffect,
  useState,
} from 'react'
import { CommandCard } from './components/CommandCard/CommandCard'
import { Tile } from './components/Tile/Tile'
import {
  getNextMoveHint,
  getUseCheckCards,
} from './core/assist/assistHints'
import {
  createAssistHistory,
  getRecordedNextMoveCardId,
  getUsedAssistTypes,
  hasAssistBeenUsed,
  recordAssistUsage,
  recordNextMoveHint,
} from './core/assist/assistHistory'
import { calculateStars } from './core/calculateStars'
import { executeCard } from './core/executeCard'
import { getPreviewArray } from './core/getPreviewArray'
import {
  createHandOrderHistory,
  ensurePuzzleHandOrder,
  getOrderedHand,
} from './core/hand/handOrder'
import { isCleared } from './core/isCleared'
import {
  createProgressHistory,
  getPuzzleProgress,
  isPuzzleUnlocked,
  recordPuzzleCleared,
  recordPuzzleSkipped,
} from './core/progress/progressHistory'
import { easyPuzzles } from './data/puzzles/easy'
import { veryEasyPuzzles } from './data/puzzles/veryEasy'
import type { AssistHistory } from './domain/assist'
import type { HandOrderHistory } from './domain/handOrder'
import type { PuzzleDefinition } from './domain/puzzle'
import type { ProgressHistory } from './domain/progress'
import type { RuntimeState } from './domain/runtimeState'

const fixedPuzzles = [
  ...veryEasyPuzzles,
  ...easyPuzzles,
]

type AttemptOutcome =
  | 'PLAYING'
  | 'SKIPPED'

function createInitialRuntimeState(
  puzzle: PuzzleDefinition,
): RuntimeState {
  return {
    currentArray: [...puzzle.start],
    remainingCards: [...puzzle.hand],
    usedCards: [],
    moveCount: 0,
  }
}

function App() {
  const [puzzleIndex, setPuzzleIndex] =
    useState(0)

  const puzzle = fixedPuzzles[puzzleIndex]

  const [runtimeState, setRuntimeState] =
    useState<RuntimeState>(
      () => createInitialRuntimeState(puzzle),
    )

  const [
    assistHistory,
    setAssistHistory,
  ] = useState<AssistHistory>(
    () => createAssistHistory(),
  )

  const [
    handOrderHistory,
    setHandOrderHistory,
  ] = useState<HandOrderHistory>(() =>
    ensurePuzzleHandOrder(
      createHandOrderHistory(),
      fixedPuzzles[0],
    ),
  )

  const [
    progressHistory,
    setProgressHistory,
  ] = useState<ProgressHistory>(
    () => createProgressHistory(),
  )

  const [
    attemptOutcome,
    setAttemptOutcome,
  ] = useState<AttemptOutcome>('PLAYING')

  const [hoveredCardId, setHoveredCardId] =
    useState<string | null>(null)

  const [assistNotice, setAssistNotice] =
    useState<string | null>(null)

  const displayArray = hoveredCardId
    ? getPreviewArray(
        runtimeState,
        hoveredCardId,
      )
    : runtimeState.currentArray

  const cleared = isCleared(
    runtimeState.currentArray,
    puzzle.target,
  )

  const skipped =
    attemptOutcome === 'SKIPPED'

  const attemptFinished =
    cleared || skipped

  const usedAssistTypes = getUsedAssistTypes(
    assistHistory,
    puzzle.id,
  )

  const useCheckUsed = hasAssistBeenUsed(
    assistHistory,
    puzzle.id,
    'USE_CHECK',
  )

  const orderCheckUsed = hasAssistBeenUsed(
    assistHistory,
    puzzle.id,
    'ORDER_CHECK',
  )

  const nextMoveUsed = hasAssistBeenUsed(
    assistHistory,
    puzzle.id,
    'NEXT_MOVE',
  )

  const useCheckCards =
    getUseCheckCards(puzzle)

  const revealedUnusedCardIds = new Set(
    useCheckUsed
      ? useCheckCards.map((card) => card.id)
      : [],
  )

  const orderHint =
    puzzle.assistConfig?.orderHint

  const nextMoveCardId =
    getRecordedNextMoveCardId(
      assistHistory,
      puzzle.id,
    )

  const stars = calculateStars(
    usedAssistTypes,
    cleared,
  )

  const displayedHand = getOrderedHand(
    handOrderHistory,
    puzzle,
  )

  const hasNextPuzzle =
    puzzleIndex < fixedPuzzles.length - 1

  useEffect(() => {
    if (!cleared) {
      return
    }

    setProgressHistory(
      (currentHistory) =>
        recordPuzzleCleared(
          currentHistory,
          puzzle.id,
          stars,
        ),
    )
  }, [
    cleared,
    puzzle.id,
    stars,
  ])

  function openPuzzle(
    nextPuzzleIndex: number,
  ) {
    const nextPuzzle =
      fixedPuzzles[nextPuzzleIndex]

    setHandOrderHistory(
      (currentHistory) =>
        ensurePuzzleHandOrder(
          currentHistory,
          nextPuzzle,
        ),
    )

    setPuzzleIndex(nextPuzzleIndex)

    setRuntimeState(
      createInitialRuntimeState(nextPuzzle),
    )

    setAttemptOutcome('PLAYING')
    setHoveredCardId(null)
    setAssistNotice(null)
  }

  function handlePuzzleSelect(
    nextPuzzleIndex: number,
  ) {
    if (
      !isPuzzleUnlocked(
        fixedPuzzles,
        nextPuzzleIndex,
        progressHistory,
      )
    ) {
      return
    }

    openPuzzle(nextPuzzleIndex)
  }

  function handleExecute(cardId: string) {
    if (attemptFinished) {
      return
    }

    setRuntimeState((currentState) =>
      executeCard(currentState, cardId),
    )

    setHoveredCardId(null)
    setAssistNotice(null)
  }

  function handleRestart() {
    setRuntimeState(
      createInitialRuntimeState(puzzle),
    )

    setAttemptOutcome('PLAYING')
    setHoveredCardId(null)
    setAssistNotice(null)
  }

  function handleNextPuzzle() {
    if (!hasNextPuzzle) {
      return
    }

    openPuzzle(puzzleIndex + 1)
  }

  function handleSkip() {
    if (attemptFinished) {
      return
    }

    const confirmed = window.confirm(
      'この問題をSkipしますか？\nStarsは0になり、次の問題が解放されます。',
    )

    if (!confirmed) {
      return
    }

    setProgressHistory(
      (currentHistory) =>
        recordPuzzleSkipped(
          currentHistory,
          puzzle.id,
        ),
    )

    setAttemptOutcome('SKIPPED')
    setHoveredCardId(null)
    setAssistNotice(null)
  }

  function handleUseCheck() {
    if (
      attemptFinished ||
      useCheckCards.length === 0
    ) {
      return
    }

    setAssistHistory((currentHistory) =>
      recordAssistUsage(
        currentHistory,
        puzzle.id,
        'USE_CHECK',
      ),
    )

    setAssistNotice(
      `USE CHECK: 使わないカードを${useCheckCards.length}枚表示しました。`,
    )
  }

  function handleOrderCheck() {
    if (
      attemptFinished ||
      !orderHint
    ) {
      return
    }

    setAssistHistory((currentHistory) =>
      recordAssistUsage(
        currentHistory,
        puzzle.id,
        'ORDER_CHECK',
      ),
    )

    setAssistNotice(
      `ORDER CHECK: ${orderHint.step}番目に使うカードを表示しました。`,
    )
  }

  function handleNextMove() {
    if (attemptFinished) {
      return
    }

    if (nextMoveUsed) {
      setAssistNotice(
        'NEXT MOVE: すでに開示したカードを表示しています。',
      )

      return
    }

    const result = getNextMoveHint(
      puzzle,
      runtimeState.usedCards,
    )

    if (result.status === 'UNAVAILABLE') {
      if (
        result.reason ===
        'OFF_DESIGN_PATH'
      ) {
        setAssistNotice(
          'NEXT MOVE: Design Solutionの経路外にいるため回答できません。',
        )
      } else {
        setAssistNotice(
          'NEXT MOVE: Design Solutionはすでに完了しています。',
        )
      }

      return
    }

    setAssistHistory((currentHistory) =>
      recordNextMoveHint(
        currentHistory,
        puzzle.id,
        result.cardId,
      ),
    )

    setAssistNotice(
      'NEXT MOVE: 次に使うカードを表示しました。',
    )
  }

  return (
    <main>
      <h1>Array Puzzle</h1>

      <div>
        {fixedPuzzles.map(
          (puzzleOption, index) => {
            const progress =
              getPuzzleProgress(
                progressHistory,
                puzzleOption.id,
              )

            const unlocked =
              isPuzzleUnlocked(
                fixedPuzzles,
                index,
                progressHistory,
              )

            let buttonLabel =
              puzzleOption.id

            if (!unlocked) {
              buttonLabel =
                `LOCKED ${puzzleOption.id}`
            } else if (
              progress.status === 'CLEARED'
            ) {
              buttonLabel =
                `${puzzleOption.id} ★${progress.bestStars ?? 0}`
            } else if (
              progress.status === 'SKIPPED'
            ) {
              buttonLabel =
                `${puzzleOption.id} SKIPPED`
            }

            return (
              <button
                key={puzzleOption.id}
                type="button"
                onClick={() =>
                  handlePuzzleSelect(index)
                }
                disabled={
                  index === puzzleIndex ||
                  !unlocked
                }
              >
                {buttonLabel}
              </button>
            )
          },
        )}
      </div>

      <section>
        <h2>{puzzle.id}</h2>

        <div>
          <strong>ASSIST</strong>

          <div>
            <button
              type="button"
              onClick={handleUseCheck}
              disabled={
                attemptFinished ||
                useCheckCards.length === 0
              }
            >
              USE CHECK
              {useCheckUsed ? ' ✓' : ''}
            </button>

            <button
              type="button"
              onClick={handleOrderCheck}
              disabled={
                attemptFinished ||
                !orderHint
              }
            >
              ORDER CHECK
              {orderCheckUsed ? ' ✓' : ''}
            </button>

            <button
              type="button"
              onClick={handleNextMove}
              disabled={attemptFinished}
            >
              NEXT MOVE
              {nextMoveUsed ? ' ✓' : ''}
            </button>
          </div>

          <div>
            <small>
              ASSISTS USED:{' '}
              {usedAssistTypes.length}
            </small>
          </div>

          {assistNotice && (
            <p>{assistNotice}</p>
          )}
        </div>

        <div>
          <strong>CURRENT</strong>

          <div>
            {displayArray.map(
              (value, index) => (
                <Tile
                  key={`current-${index}`}
                  value={value}
                  index={index}
                  isMatched={
                    value ===
                    puzzle.target[index]
                  }
                  isPreviewChanged={
                    hoveredCardId !== null &&
                    value !==
                      runtimeState
                        .currentArray[index]
                  }
                />
              ),
            )}
          </div>
        </div>

        <div>
          <strong>TARGET</strong>

          <div>
            {puzzle.target.map(
              (value, index) => (
                <Tile
                  key={`target-${index}`}
                  value={value}
                  index={index}
                />
              ),
            )}
          </div>
        </div>

        {cleared && (
          <div>
            <strong>CLEAR!</strong>

            <div>
              <strong>
                STARS:{' '}
                {stars > 0
                  ? '★'.repeat(stars)
                  : '0'}
              </strong>
            </div>

            {hasNextPuzzle && (
              <div>
                <button
                  type="button"
                  onClick={
                    handleNextPuzzle
                  }
                >
                  NEXT PUZZLE
                </button>
              </div>
            )}
          </div>
        )}

        {skipped && (
          <div>
            <strong>SKIPPED</strong>

            <div>
              <strong>STARS: 0</strong>
            </div>

            {hasNextPuzzle && (
              <div>
                <button
                  type="button"
                  onClick={
                    handleNextPuzzle
                  }
                >
                  NEXT PUZZLE
                </button>
              </div>
            )}
          </div>
        )}

        <div>
          <strong>
            MOVES:{' '}
            {runtimeState.moveCount}
          </strong>
        </div>

        <div>
          <button
            type="button"
            onClick={handleRestart}
          >
            RESTART
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={attemptFinished}
          >
            SKIP
          </button>
        </div>

        <div>
          <strong>HAND</strong>

          <div>
            {displayedHand.map((card) => {
              const isUsed =
                runtimeState.usedCards.some(
                  (usedCard) =>
                    usedCard.id === card.id,
                )

              const orderHintStep =
                orderCheckUsed &&
                orderHint?.cardId === card.id
                  ? orderHint.step
                  : undefined

              return (
                <CommandCard
                  key={card.id}
                  card={card}
                  disabled={
                    isUsed ||
                    attemptFinished
                  }
                  isExcludedByUseCheck={revealedUnusedCardIds.has(
                    card.id,
                  )}
                  orderHintStep={
                    orderHintStep
                  }
                  isNextMoveHint={
                    nextMoveCardId ===
                    card.id
                  }
                  onHoverStart={
                    setHoveredCardId
                  }
                  onHoverEnd={() =>
                    setHoveredCardId(null)
                  }
                  onExecute={
                    handleExecute
                  }
                />
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App