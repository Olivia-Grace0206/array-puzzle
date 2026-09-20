import {
  useEffect,
  useRef,
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
  ensurePuzzleHandOrder,
  getOrderedHand,
} from './core/hand/handOrder'
import { isCleared } from './core/isCleared'
import {
  loadGameSave,
  saveGameSave,
} from './core/persistence/gameStorage'
import {
  getPuzzleProgress,
  isPuzzleCompleted,
  isPuzzleUnlocked,
  recordPuzzleCleared,
  recordPuzzleSkipped,
} from './core/progress/progressHistory'
import {
  difficultyOptions,
  fixedPuzzles,
  type DifficultyId,
} from './data/puzzles/catalog'
import type { AssistHistory } from './domain/assist'
import type { HandOrderHistory } from './domain/handOrder'
import type { PuzzleDefinition } from './domain/puzzle'
import type { ProgressHistory } from './domain/progress'
import type { RuntimeState } from './domain/runtimeState'

type AppScreen =
  | 'MAIN'
  | 'DIFFICULTY'
  | 'STAGE_SELECT'
  | 'PUZZLE'

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
  const [initialSave] = useState(() =>
    loadGameSave(window.localStorage),
  )

  const [screen, setScreen] =
    useState<AppScreen>('MAIN')

  const [
    selectedDifficultyId,
    setSelectedDifficultyId,
  ] = useState<DifficultyId | null>(null)

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
    initialSave.assistHistory,
  )

  const [
    handOrderHistory,
    setHandOrderHistory,
  ] = useState<HandOrderHistory>(
    initialSave.handOrderHistory,
  )

  const [
    progressHistory,
    setProgressHistory,
  ] = useState<ProgressHistory>(
    initialSave.progressHistory,
  )

  const [
    attemptOutcome,
    setAttemptOutcome,
  ] = useState<AttemptOutcome>('PLAYING')

  const [hoveredCardId, setHoveredCardId] =
    useState<string | null>(null)

  const [assistNotice, setAssistNotice] =
    useState<string | null>(null)

  const [
    skipConfirmationOpen,
    setSkipConfirmationOpen,
  ] = useState(false)

  const resultDialogRef =
    useRef<HTMLElement | null>(null)

  const skipDialogRef =
    useRef<HTMLElement | null>(null)

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

  const showClearDialog =
    screen === 'PUZZLE' && cleared

  const blockingModalOpen =
    showClearDialog ||
    skipConfirmationOpen

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

  const selectedDifficulty =
    difficultyOptions.find(
      (difficulty) =>
        difficulty.id ===
        selectedDifficultyId,
    ) ?? null

  const completedPuzzleCount =
    fixedPuzzles.filter((fixedPuzzle) =>
      isPuzzleCompleted(
        progressHistory,
        fixedPuzzle.id,
      ),
    ).length

  const totalBestStars =
    fixedPuzzles.reduce(
      (total, fixedPuzzle) =>
        total +
        (
          getPuzzleProgress(
            progressHistory,
            fixedPuzzle.id,
          ).bestStars ?? 0
        ),
      0,
    )

  useEffect(() => {
    saveGameSave(
      window.localStorage,
      {
        version: 1,
        assistHistory,
        handOrderHistory,
        progressHistory,
      },
    )
  }, [
    assistHistory,
    handOrderHistory,
    progressHistory,
  ])

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

  useEffect(() => {
    if (!showClearDialog) {
      return
    }

    resultDialogRef.current?.focus()
  }, [showClearDialog])

  useEffect(() => {
    if (!skipConfirmationOpen) {
      return
    }

    skipDialogRef.current?.focus()
  }, [skipConfirmationOpen])

  function getDifficultyForPuzzle(
    puzzleId: string,
  ) {
    return difficultyOptions.find(
      (difficulty) =>
        difficulty.puzzles.some(
          (difficultyPuzzle) =>
            difficultyPuzzle.id === puzzleId,
        ),
    )
  }

  function isDifficultyUnlocked(
    difficultyId: DifficultyId,
  ): boolean {
    const difficulty =
      difficultyOptions.find(
        (option) =>
          option.id === difficultyId,
      )

    if (
      !difficulty ||
      !difficulty.available ||
      difficulty.puzzles.length === 0
    ) {
      return false
    }

    const firstPuzzle =
      difficulty.puzzles[0]

    const firstPuzzleIndex =
      fixedPuzzles.findIndex(
        (fixedPuzzle) =>
          fixedPuzzle.id === firstPuzzle.id,
      )

    return isPuzzleUnlocked(
      fixedPuzzles,
      firstPuzzleIndex,
      progressHistory,
    )
  }

  function openPuzzle(
    nextPuzzleIndex: number,
  ) {
    const nextPuzzle =
      fixedPuzzles[nextPuzzleIndex]

    const nextDifficulty =
      getDifficultyForPuzzle(nextPuzzle.id)

    setHandOrderHistory(
      (currentHistory) =>
        ensurePuzzleHandOrder(
          currentHistory,
          nextPuzzle,
        ),
    )

    if (nextDifficulty) {
      setSelectedDifficultyId(
        nextDifficulty.id,
      )
    }

    setPuzzleIndex(nextPuzzleIndex)

    setRuntimeState(
      createInitialRuntimeState(nextPuzzle),
    )

    setAttemptOutcome('PLAYING')
    setHoveredCardId(null)
    setAssistNotice(null)
    setSkipConfirmationOpen(false)
    setScreen('PUZZLE')
  }

  function handleDifficultySelect(
    difficultyId: DifficultyId,
  ) {
    if (
      !isDifficultyUnlocked(
        difficultyId,
      )
    ) {
      return
    }

    setSelectedDifficultyId(
      difficultyId,
    )

    setScreen('STAGE_SELECT')
  }

  function handleStageSelect(
    selectedPuzzle: PuzzleDefinition,
  ) {
    const selectedPuzzleIndex =
      fixedPuzzles.findIndex(
        (fixedPuzzle) =>
          fixedPuzzle.id ===
          selectedPuzzle.id,
      )

    if (
      !isPuzzleUnlocked(
        fixedPuzzles,
        selectedPuzzleIndex,
        progressHistory,
      )
    ) {
      return
    }

    openPuzzle(selectedPuzzleIndex)
  }

  function handleBackToStages() {
    setSkipConfirmationOpen(false)
    setHoveredCardId(null)
    setScreen('STAGE_SELECT')
  }

  function handleBackToDifficulty() {
    setSkipConfirmationOpen(false)
    setScreen('DIFFICULTY')
  }

  function handleBackToMain() {
    setSkipConfirmationOpen(false)
    setScreen('MAIN')
  }

  function handleExecute(cardId: string) {
    if (
      attemptFinished ||
      skipConfirmationOpen
    ) {
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
    setSkipConfirmationOpen(false)
  }

  function handleNextPuzzle() {
    if (!hasNextPuzzle) {
      handleBackToStages()
      return
    }

    openPuzzle(puzzleIndex + 1)
  }

  function handleSkip() {
    if (attemptFinished) {
      return
    }

    setHoveredCardId(null)
    setSkipConfirmationOpen(true)
  }

  function handleCancelSkip() {
    setSkipConfirmationOpen(false)
  }

  function handleConfirmSkip() {
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
    setSkipConfirmationOpen(false)
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

  function renderHeaderActions() {
    if (screen === 'MAIN') {
      return null
    }

    if (screen === 'DIFFICULTY') {
      return (
        <button
          type="button"
          className="header-nav-button"
          onClick={handleBackToMain}
        >
          MAIN
        </button>
      )
    }

    if (screen === 'STAGE_SELECT') {
      return (
        <div className="header-nav-actions">
          <button
            type="button"
            className="header-nav-button"
            onClick={handleBackToDifficulty}
          >
            DIFFICULTY
          </button>

          <button
            type="button"
            className="header-nav-button"
            onClick={handleBackToMain}
          >
            MAIN
          </button>
        </div>
      )
    }

    return (
      <div className="header-nav-actions">
        <button
          type="button"
          className="header-nav-button"
          onClick={handleBackToStages}
        >
          STAGE SELECT
        </button>

        <button
          type="button"
          className="header-nav-button"
          onClick={handleBackToMain}
        >
          MAIN
        </button>
      </div>
    )
  }

  function renderMainScreen() {
    return (
      <section className="menu-screen main-screen">
        <div className="main-hero">
          <p className="menu-kicker">
            COMMAND ORDER PUZZLE
          </p>

          <h2>
            Choose.
            <br />
            Order.
            <br />
            Transform.
          </h2>

          <p className="main-description">
            Commandカードを選び、
            正しい順番で配列を目標の形へ変換します。
          </p>

          <button
            type="button"
            className="menu-primary-button"
            onClick={() =>
              setScreen('DIFFICULTY')
            }
          >
            PLAY
          </button>
        </div>

        <aside className="main-progress-card">
          <p className="menu-kicker">
            YOUR PROGRESS
          </p>

          <div className="main-progress-value">
            {completedPuzzleCount}
            <span>
              / {fixedPuzzles.length}
            </span>
          </div>

          <p className="main-progress-label">
            Stages completed
          </p>

          <div className="main-progress-divider" />

          <div className="main-star-summary">
            <span>TOTAL STARS</span>

            <strong>
              ★ {totalBestStars}
            </strong>
          </div>
        </aside>
      </section>
    )
  }

  function renderDifficultyScreen() {
    return (
      <section className="menu-screen">
        <div className="menu-heading">
          <p className="menu-kicker">
            SELECT MODE
          </p>

          <h2>Choose Difficulty</h2>

          <p>
            難易度を選んで固定問題へ進みます。
          </p>
        </div>

        <div className="difficulty-grid">
          {difficultyOptions.map(
            (difficulty) => {
              const unlocked =
                isDifficultyUnlocked(
                  difficulty.id,
                )

              let statusLabel =
                'AVAILABLE'

              if (!difficulty.available) {
                statusLabel =
                  'COMING SOON'
              } else if (!unlocked) {
                statusLabel = 'LOCKED'
              }

              return (
                <button
                  key={difficulty.id}
                  type="button"
                  className={[
                    'difficulty-card',
                    unlocked
                      ? 'difficulty-card-available'
                      : 'difficulty-card-disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!unlocked}
                  onClick={() =>
                    handleDifficultySelect(
                      difficulty.id,
                    )
                  }
                >
                  <span className="difficulty-status">
                    {statusLabel}
                  </span>

                  <strong>
                    {difficulty.label}
                  </strong>

                  <span className="difficulty-description">
                    {difficulty.description}
                  </span>

                  {difficulty.puzzles.length >
                    0 && (
                    <span className="difficulty-stage-count">
                      {
                        difficulty.puzzles
                          .length
                      }{' '}
                      STAGES
                    </span>
                  )}
                </button>
              )
            },
          )}

          <button
            type="button"
            className="difficulty-card difficulty-card-generated"
            disabled
          >
            <span className="difficulty-status">
              COMING SOON
            </span>

            <strong>AUTO GENERATE</strong>

            <span className="difficulty-description">
              検証済みの問題を自動生成する
              Endlessモード
            </span>
          </button>
        </div>
      </section>
    )
  }

  function renderStageSelectScreen() {
    if (!selectedDifficulty) {
      return null
    }

    return (
      <section className="menu-screen">
        <div className="menu-heading">
          <p className="menu-kicker">
            {selectedDifficulty.label}
          </p>

          <h2>Stage Select</h2>

          <p>
            ClearまたはSkipで次のStageが
            解放されます。
          </p>
        </div>

        <div className="stage-grid">
          {selectedDifficulty.puzzles.map(
            (
              stagePuzzle,
              difficultyIndex,
            ) => {
              const globalIndex =
                fixedPuzzles.findIndex(
                  (fixedPuzzle) =>
                    fixedPuzzle.id ===
                    stagePuzzle.id,
                )

              const progress =
                getPuzzleProgress(
                  progressHistory,
                  stagePuzzle.id,
                )

              const unlocked =
                isPuzzleUnlocked(
                  fixedPuzzles,
                  globalIndex,
                  progressHistory,
                )

              return (
                <button
                  key={stagePuzzle.id}
                  type="button"
                  className={[
                    'stage-card',
                    !unlocked
                      ? 'stage-card-locked'
                      : '',
                    progress.status ===
                    'CLEARED'
                      ? 'stage-card-cleared'
                      : '',
                    progress.status ===
                    'SKIPPED'
                      ? 'stage-card-skipped'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!unlocked}
                  onClick={() =>
                    handleStageSelect(
                      stagePuzzle,
                    )
                  }
                >
                  <span className="stage-card-number">
                    {String(
                      difficultyIndex + 1,
                    ).padStart(2, '0')}
                  </span>

                  <strong>
                    {stagePuzzle.id}
                  </strong>

                  <span className="stage-card-status">
                    {!unlocked &&
                      'LOCKED'}

                    {unlocked &&
                      progress.status ===
                        'UNPLAYED' &&
                      'PLAY'}

                    {progress.status ===
                      'CLEARED' &&
                      `★${progress.bestStars ?? 0}`}

                    {progress.status ===
                      'SKIPPED' &&
                      'SKIPPED'}
                  </span>
                </button>
              )
            },
          )}
        </div>
      </section>
    )
  }

  function renderPuzzleScreen() {
    return (
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
    )
  }

  return (
    <>
      <main
        className="app-shell"
        inert={blockingModalOpen}
        aria-hidden={
          blockingModalOpen
            ? true
            : undefined
        }
      >
        <header className="app-header">
          <div className="app-brand">
            <p className="app-eyebrow">
              COMMAND ORDER PUZZLE
            </p>

            <h1>Array Puzzle</h1>
          </div>

          {renderHeaderActions()}
        </header>

        {screen === 'MAIN' &&
          renderMainScreen()}

        {screen === 'DIFFICULTY' &&
          renderDifficultyScreen()}

        {screen === 'STAGE_SELECT' &&
          renderStageSelectScreen()}

        {screen === 'PUZZLE' &&
          renderPuzzleScreen()}
      </main>

      {showClearDialog && (
        <div className="result-backdrop">
          <section
            ref={resultDialogRef}
            className="clear-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-dialog-title"
            aria-describedby="clear-dialog-score"
            tabIndex={-1}
          >
            <p className="clear-dialog-kicker">
              PUZZLE COMPLETE
            </p>

            <h2 id="clear-dialog-title">
              CLEAR!
            </h2>

            <div
              id="clear-dialog-score"
              className="clear-dialog-stars"
              aria-label={`${stars} out of 3 stars`}
            >
              {[1, 2, 3].map(
                (starNumber) => (
                  <span
                    key={starNumber}
                    className={
                      starNumber <= stars
                        ? 'clear-star clear-star-earned'
                        : 'clear-star clear-star-empty'
                    }
                    aria-hidden="true"
                  >
                    ★
                  </span>
                ),
              )}
            </div>

            <p className="clear-dialog-caption">
              {stars} / 3 STARS
            </p>

            <div className="clear-dialog-actions">
              <button
                type="button"
                className="clear-dialog-button clear-dialog-button-restart"
                onClick={handleRestart}
              >
                RESTART
              </button>

              <button
                type="button"
                className="clear-dialog-button clear-dialog-button-next"
                onClick={handleNextPuzzle}
              >
                {hasNextPuzzle
                  ? 'NEXT LEVEL'
                  : 'STAGE SELECT'}
              </button>
            </div>
          </section>
        </div>
      )}

      {skipConfirmationOpen && (
        <div className="result-backdrop">
          <section
            ref={skipDialogRef}
            className="clear-dialog skip-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skip-dialog-title"
            aria-describedby="skip-dialog-description"
            tabIndex={-1}
          >
            <div
              className="skip-dialog-icon"
              aria-hidden="true"
            >
              ↷
            </div>

            <p className="clear-dialog-kicker">
              SKIP STAGE
            </p>

            <h2 id="skip-dialog-title">
              Skip this puzzle?
            </h2>

            <p
              id="skip-dialog-description"
              className="skip-dialog-description"
            >
              この問題の獲得Starsは0になります。
              <br />
              次のStageは解放され、
              あとから再挑戦できます。
            </p>

            <div className="skip-dialog-stars">
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>

            <div className="clear-dialog-actions">
              <button
                type="button"
                className="clear-dialog-button clear-dialog-button-restart"
                onClick={handleCancelSkip}
              >
                CANCEL
              </button>

              <button
                type="button"
                className="clear-dialog-button skip-confirm-button"
                onClick={handleConfirmSkip}
              >
                SKIP
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default App