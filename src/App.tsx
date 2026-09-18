import { useState } from 'react'
import { CommandCard } from './components/CommandCard/CommandCard'
import { Tile } from './components/Tile/Tile'
import { calculateStars } from './core/calculateStars'
import { executeCard } from './core/executeCard'
import { getPreviewArray } from './core/getPreviewArray'
import { isCleared } from './core/isCleared'
import { easyPuzzles } from './data/puzzles/easy'
import { veryEasyPuzzles } from './data/puzzles/veryEasy'
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
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = fixedPuzzles[puzzleIndex]

  const [runtimeState, setRuntimeState] = useState<RuntimeState>(
    () => createInitialRuntimeState(puzzle),
  )

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

  const displayArray = hoveredCardId
    ? getPreviewArray(runtimeState, hoveredCardId)
    : runtimeState.currentArray

  const cleared = isCleared(
    runtimeState.currentArray,
    puzzle.target,
  )

  const stars = calculateStars(
    runtimeState.moveCount,
    puzzle.designSteps,
    cleared,
  )

  const hasNextPuzzle =
    puzzleIndex < fixedPuzzles.length - 1

  function handleExecute(cardId: string) {
    setRuntimeState((currentState) =>
      executeCard(currentState, cardId),
    )

    setHoveredCardId(null)
  }

  function handleRestart() {
    setRuntimeState(createInitialRuntimeState(puzzle))
    setHoveredCardId(null)
  }

  function handlePuzzleChange(nextPuzzleIndex: number) {
    const nextPuzzle = fixedPuzzles[nextPuzzleIndex]

    setPuzzleIndex(nextPuzzleIndex)
    setRuntimeState(createInitialRuntimeState(nextPuzzle))
    setHoveredCardId(null)
  }

  function handleNextPuzzle() {
    if (!hasNextPuzzle) {
      return
    }

    handlePuzzleChange(puzzleIndex + 1)
  }

  return (
    <main>
      <h1>Array Puzzle</h1>

      <div>
        {fixedPuzzles.map((puzzleOption, index) => (
          <button
            key={puzzleOption.id}
            type="button"
            onClick={() => handlePuzzleChange(index)}
            disabled={index === puzzleIndex}
          >
            {puzzleOption.id}
          </button>
        ))}
      </div>

      <section>
        <h2>{puzzle.id}</h2>

        <div>
          <strong>CURRENT</strong>

          <div>
            {displayArray.map((value, index) => (
              <Tile
                key={`current-${index}`}
                value={value}
                index={index}
                isMatched={value === puzzle.target[index]}
                isPreviewChanged={
                  hoveredCardId !== null &&
                  value !== runtimeState.currentArray[index]
                }
              />
            ))}
          </div>
        </div>

        <div>
          <strong>TARGET</strong>

          <div>
            {puzzle.target.map((value, index) => (
              <Tile
                key={`target-${index}`}
                value={value}
                index={index}
              />
            ))}
          </div>
        </div>

        {cleared && (
          <div>
            <strong>CLEAR!</strong>

            <div>
              <strong>STARS: {'★'.repeat(stars)}</strong>
            </div>

            {hasNextPuzzle && (
              <div>
                <button
                  type="button"
                  onClick={handleNextPuzzle}
                >
                  NEXT PUZZLE
                </button>
              </div>
            )}
          </div>
        )}

        <div>
          <strong>MOVES: {runtimeState.moveCount}</strong>
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
              const isUsed = runtimeState.usedCards.some(
                (usedCard) => usedCard.id === card.id,
              )

              return (
                <CommandCard
                  key={card.id}
                  card={card}
                  disabled={isUsed}
                  onHoverStart={setHoveredCardId}
                  onHoverEnd={() => setHoveredCardId(null)}
                  onExecute={handleExecute}
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