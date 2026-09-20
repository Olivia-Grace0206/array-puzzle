import {
  useEffect,
  useState,
} from 'react'
import './App.css'
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
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <p className="app-eyebrow">
            COMMAND ORDER PUZZLE
          </p>

          <h1>Array Puzzle</h1>
        </div>

        <nav
          className="stage-strip"
          aria-label="Development stage selector"
        >
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

              const className = [
                'stage-button',
                index === puzzleIndex
                  ? 'stage-button-active'
                  : '',
                !unlocked
                  ? 'stage-button-locked'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  key={puzzleOption.id}
                  type="button"
                  className={className}
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
        </nav>
      </header>

      <section className="puzzle-screen">
        <div className="puzzle-heading">
          <div>
            <p className="section-eyebrow">
              CURRENT STAGE
            </p>

            <h2>{puzzle.id}</h2>
          </div>

          <div className="puzzle-stats">
            <div className="stat-item">
              <span className="stat-label">
                MOVES
              </span>

              <strong>
                {runtimeState.moveCount}
              </strong>
            </div>

            <div className="stat-item">
              <span className="stat-label">
                ASSISTS
              </span>

              <strong>
                {usedAssistTypes.length}
              </strong>
            </div>
          </div>
        </div>

        <section
          className="assist-panel"
          aria-labelledby="assist-title"
        >
          <div className="panel-heading">
            <div>
              <p className="section-eyebrow">
                HELP CARDS
              </p>

              <h3 id="assist-title">
                ASSIST
              </h3>
            </div>

            <span className="assist-cost">
              1 Assist = −1 Star
            </span>
          </div>

          <div className="assist-buttons">
            <button
              type="button"
              className={[
                'assist-button',
                useCheckUsed
                  ? 'assist-button-used'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={handleUseCheck}
              disabled={
                attemptFinished ||
                useCheckCards.length === 0
              }
            >
              <span className="assist-button-name">
                USE CHECK
              </span>

              <span className="assist-button-description">
                使わないカードを表示
              </span>

              {useCheckUsed && (
                <span className="assist-used-mark">
                  USED
                </span>
              )}
            </button>

            <button
              type="button"
              className={[
                'assist-button',
                orderCheckUsed
                  ? 'assist-button-used'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={handleOrderCheck}
              disabled={
                attemptFinished ||
                !orderHint
              }
            >
              <span className="assist-button-name">
                ORDER CHECK
              </span>

              <span className="assist-button-description">
                使用順を1枚表示
              </span>

              {orderCheckUsed && (
                <span className="assist-used-mark">
                  USED
                </span>
              )}
            </button>

            <button
              type="button"
              className={[
                'assist-button',
                nextMoveUsed
                  ? 'assist-button-used'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={handleNextMove}
              disabled={attemptFinished}
            >
              <span className="assist-button-name">
                NEXT MOVE
              </span>

              <span className="assist-button-description">
                次の正解カードを表示
              </span>

              {nextMoveUsed && (
                <span className="assist-used-mark">
                  USED
                </span>
              )}
            </button>
          </div>

          <p
            className={[
              'assist-notice',
              assistNotice
                ? ''
                : 'assist-notice-idle',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {assistNotice ??
              'Assistを選ぶと、この問題のStarsが減少します。'}
          </p>
        </section>

        <section className="board-panel">
          <div className="board-row">
            <div className="board-label">
              <span className="board-label-main">
                CURRENT
              </span>

              <span className="board-label-sub">
                現在の配列
              </span>
            </div>

            <div className="tile-row">
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

          <div className="board-divider" />

          <div className="board-row">
            <div className="board-label">
              <span className="board-label-main">
                TARGET
              </span>

              <span className="board-label-sub">
                目標の配列
              </span>
            </div>

            <div className="tile-row">
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
        </section>

        {cleared && (
          <section className="result-panel result-panel-clear">
            <div>
              <p className="result-kicker">
                PUZZLE COMPLETE
              </p>

              <strong className="result-title">
                CLEAR!
              </strong>
            </div>

            <div className="result-stars">
              {stars > 0
                ? '★'.repeat(stars)
                : '0 Stars'}
            </div>

            {hasNextPuzzle && (
              <button
                type="button"
                className="result-button"
                onClick={handleNextPuzzle}
              >
                NEXT PUZZLE
              </button>
            )}
          </section>
        )}

        {skipped && (
          <section className="result-panel result-panel-skipped">
            <div>
              <p className="result-kicker">
                STAGE SKIPPED
              </p>

              <strong className="result-title">
                SKIPPED
              </strong>
            </div>

            <div className="result-stars">
              0 Stars
            </div>

            {hasNextPuzzle && (
              <button
                type="button"
                className="result-button"
                onClick={handleNextPuzzle}
              >
                NEXT PUZZLE
              </button>
            )}
          </section>
        )}

        <div className="play-actions">
          <button
            type="button"
            className="action-button"
            onClick={handleRestart}
          >
            RESTART
          </button>

          <button
            type="button"
            className="action-button action-button-skip"
            onClick={handleSkip}
            disabled={attemptFinished}
          >
            SKIP
          </button>
        </div>

        <section
          className="hand-panel"
          aria-labelledby="hand-title"
        >
          <div className="hand-heading">
            <div>
              <p className="section-eyebrow section-eyebrow-light">
                CHOOSE A COMMAND
              </p>

              <h3 id="hand-title">
                HAND
              </h3>
            </div>

            <div className="hand-count">
              <strong>
                {
                  runtimeState
                    .remainingCards.length
                }
              </strong>

              <span>cards remaining</span>
            </div>
          </div>

          <div className="hand-cards">
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
        </section>
      </section>
    </main>
  )
}

export default App