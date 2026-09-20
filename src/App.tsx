import { useState } from 'react'
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
import { isCleared } from './core/isCleared'
import { easyPuzzles } from './data/puzzles/easy'
import { veryEasyPuzzles } from './data/puzzles/veryEasy'
import type { AssistHistory } from './domain/assist'
import type { PuzzleDefinition } from './domain/puzzle'
import type { RuntimeState } from './domain/runtimeState'

const fixedPuzzles = [
  ...veryEasyPuzzles,
  ...easyPuzzles,
]

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

  const hasNextPuzzle =
    puzzleIndex < fixedPuzzles.length - 1

  function handleExecute(cardId: string) {
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

    setHoveredCardId(null)
    setAssistNotice(null)
  }

  function handlePuzzleChange(
    nextPuzzleIndex: number,
  ) {
    const nextPuzzle =
      fixedPuzzles[nextPuzzleIndex]

    setPuzzleIndex(nextPuzzleIndex)

    setRuntimeState(
      createInitialRuntimeState(nextPuzzle),
    )

    setHoveredCardId(null)
    setAssistNotice(null)
  }

  function handleNextPuzzle() {
    if (!hasNextPuzzle) {
      return
    }

    handlePuzzleChange(puzzleIndex + 1)
  }

  function handleUseCheck() {
    if (useCheckCards.length === 0) {
      setAssistNotice(
        'USE CHECK: この問題には使わないカードがありません。',
      )

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
    if (!orderHint) {
      setAssistNotice(
        'ORDER CHECK: この問題にはORDER CHECK設定がありません。',
      )

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
          (puzzleOption, index) => (
            <button
              key={puzzleOption.id}
              type="button"
              onClick={() =>
                handlePuzzleChange(index)
              }
              disabled={
                index === puzzleIndex
              }
            >
              {puzzleOption.id}
            </button>
          ),
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
                cleared ||
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
                cleared || !orderHint
              }
            >
              ORDER CHECK
              {orderCheckUsed ? ' ✓' : ''}
            </button>

            <button
              type="button"
              onClick={handleNextMove}
              disabled={cleared}
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
        </div>

        <div>
          <strong>HAND</strong>

          <div>
            {puzzle.hand.map((card) => {
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
                  disabled={isUsed}
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