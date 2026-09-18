import { useState } from 'react'
import { CommandCard } from './components/CommandCard/CommandCard'
import { Tile } from './components/Tile/Tile'
import { executeCard } from './core/executeCard'
import { getPreviewArray } from './core/getPreviewArray'
import { isCleared } from './core/isCleared'
import { veryEasyPuzzles } from './data/puzzles/veryEasy'
import type { RuntimeState } from './domain/runtimeState'

function App() {
  const puzzle = veryEasyPuzzles[0]

  function createInitialRuntimeState(): RuntimeState {
    return {
      currentArray: [...puzzle.start],
      remainingCards: [...puzzle.hand],
      usedCards: [],
      moveCount: 0,
    }
  }

  const [runtimeState, setRuntimeState] = useState<RuntimeState>(
    createInitialRuntimeState,
  )

  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

  const displayArray = hoveredCardId
    ? getPreviewArray(runtimeState, hoveredCardId)
    : runtimeState.currentArray

  const cleared = isCleared(
    runtimeState.currentArray,
    puzzle.target,
  )

  function handleExecute(cardId: string) {
    setRuntimeState((currentState) =>
      executeCard(currentState, cardId),
    )

    setHoveredCardId(null)
  }

  function handleRestart() {
    setRuntimeState(createInitialRuntimeState())
    setHoveredCardId(null)
  }

  return (
    <main>
      <h1>Array Puzzle</h1>

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