"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gamepad2, Users, Check } from "lucide-react";
import { QuestionDisplay } from "@/components/trivia/question-display";
import { Leaderboard } from "@/components/trivia/leaderboard";
import {
  getTriviaGameState,
  submitTableAnswer,
  getTableAnswerForQuestion,
  hasTableAnswered,
  isTriviaOpen,
} from "@/lib/actions/trivia-actions";
import { getTables } from "@/lib/actions/table-actions";

interface GameState {
  game: {
    id: string;
    status: string;
    currentQuestion: number;
    totalQuestions: number;
  };
  question: {
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string | null;
  } | null;
  leaderboard: {
    tableId: string;
    tableNumber: number;
    totalPoints: number;
    correct: number;
    total: number;
  }[];
  answeredTables: number;
  totalTables: number;
  serverTime: string;
}

interface TableInfo {
  uniqueId: string;
  number: number;
}

export function TriviaGame() {
  const [triviaIsOpen, setTriviaIsOpen] = useState<boolean | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [tableAnswer, setTableAnswer] = useState<{
    chosenOption: string;
    isCorrect: boolean;
    points: number;
  } | null>(null);
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTable = localStorage.getItem("trivia_table");
    if (savedTable) {
      try {
        setSelectedTable(JSON.parse(savedTable));
      } catch {
        // ignore
      }
    }

    loadTables();
    isTriviaOpen().then((open) => setTriviaIsOpen(open));
  }, []);

  async function loadTables() {
    const data = await getTables();
    const tableList = data.map((t) => ({ uniqueId: t.uniqueId, number: t.number }));
    setTables(tableList);

    // Auto-select table from localStorage (from table order page)
    const tableUniqueId = localStorage.getItem("tableUniqueId");
    const savedTable = localStorage.getItem("trivia_table");
    if (tableUniqueId && !savedTable) {
      const match = tableList.find((t) => t.uniqueId === tableUniqueId);
      if (match) {
        setSelectedTable(match);
        localStorage.setItem("trivia_table", JSON.stringify(match));
      }
    }
  }

  // Poll for game state
  const pollGameState = useCallback(async () => {
    const [state, open] = await Promise.all([
      getTriviaGameState(),
      isTriviaOpen(),
    ]);
    setTriviaIsOpen(open);
    setGameState(state);

    // Reset answer state when question changes
    if (state?.question && state.question.id !== lastQuestionId) {
      setSelectedOption(null);
      setAnswered(false);
      setTableAnswer(null);
      setLastQuestionId(state.question.id);

      // Check if table already answered this question
      if (selectedTable && state.game.status === "question") {
        const alreadyAnswered = await hasTableAnswered(
          state.game.id,
          state.question.id,
          selectedTable.uniqueId
        );
        if (alreadyAnswered) {
          setAnswered(true);
        }
      }
    }

    // Fetch table answer on reveal
    if (
      (state?.game.status === "reveal" || state?.game.status === "leaderboard") &&
      state.question &&
      selectedTable
    ) {
      const answer = await getTableAnswerForQuestion(
        state.game.id,
        state.question.id,
        selectedTable.uniqueId
      );
      if (answer) {
        setTableAnswer({
          chosenOption: answer.chosenOption,
          isCorrect: answer.isCorrect,
          points: answer.points,
        });
      }
    }
  }, [selectedTable, lastQuestionId]);

  useEffect(() => {
    if (!selectedTable) return;

    pollGameState();
    const interval = setInterval(
      pollGameState,
      gameState?.game.status === "question" ? 2000 : 5000
    );
    return () => clearInterval(interval);
  }, [selectedTable, pollGameState, gameState?.game.status]);

  async function handleAnswer(option: string) {
    if (!gameState?.question || !selectedTable || answered) return;
    setSelectedOption(option);
    setAnswered(true);

    const result = await submitTableAnswer({
      gameId: gameState.game.id,
      questionId: gameState.question.id,
      tableUniqueId: selectedTable.uniqueId,
      option,
    });

    if (result && "error" in result) {
      toast.error(result.error);
      if (result.error !== "Your table already answered!") {
        setAnswered(false);
        setSelectedOption(null);
      }
    } else {
      toast.success("Answer locked in!");
    }
  }

  function handleTableSelect(table: TableInfo) {
    setSelectedTable(table);
    localStorage.setItem("trivia_table", JSON.stringify(table));
  }

  // ── Trivia is locked ──
  if (triviaIsOpen === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-8 h-8 text-gold/50" />
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-cream mb-2">
            Trivia Coming Soon
          </h2>
          <p className="text-gold-pale/50 text-sm">
            The MC will announce when trivia begins!
          </p>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (triviaIsOpen === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gold-pale/40">Loading...</p>
      </div>
    );
  }

  // ── Select table ──
  if (!selectedTable) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gold" />
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-cream mb-2">
              Select Your Table
            </h2>
            <p className="text-gold-pale/50 text-sm">
              Pick your table to join the trivia game
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {tables.map((t) => (
              <button
                key={t.uniqueId}
                onClick={() => handleTableSelect(t)}
                className="bg-royal-purple/30 border border-gold/20 p-3 text-center hover:border-gold/50 hover:bg-royal-purple/50 transition-all"
              >
                <span className="font-[family-name:var(--font-heading)] text-xl text-cream">
                  {t.number}
                </span>
              </button>
            ))}
          </div>

          {tables.length === 0 && (
            <p className="text-center text-gold-pale/40 text-sm mt-4">
              No tables available
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── No active game ──
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Gamepad2 className="w-12 h-12 text-gold/30 mx-auto mb-4" />
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-cream mb-2">
            No Game Active
          </h2>
          <p className="text-gold-pale/50 text-sm">
            Wait for the MC to start the trivia game
          </p>
          <p className="text-gold-pale/30 text-xs mt-4">
            Table {selectedTable.number}
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedTable(null);
              localStorage.removeItem("trivia_table");
            }}
            className="text-gold-pale/40 hover:text-gold text-xs mt-2"
          >
            Change Table
          </Button>
        </div>
      </div>
    );
  }

  const { game, question, leaderboard } = gameState;

  // ── Lobby ──
  if (game.status === "lobby") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Gamepad2 className="w-12 h-12 text-gold mx-auto mb-4 animate-pulse" />
          <h2 className="font-[family-name:var(--font-heading)] text-3xl text-gold-light mb-2">
            Get Ready!
          </h2>
          <p className="text-cream text-lg mb-1">Table vs Table Trivia</p>
          <p className="text-gold-pale/50 text-sm">
            {game.totalQuestions} questions &middot; Table{" "}
            {selectedTable.number}
          </p>
          <p className="text-gold-pale/30 text-xs mt-4">
            Waiting for the MC to start...
          </p>
        </div>
      </div>
    );
  }

  // ── Question ──
  if (game.status === "question" && question) {
    return (
      <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
        {/* Table badge */}
        <div className="text-center mb-6">
          <span className="inline-block bg-gold/10 border border-gold/30 px-4 py-1 text-gold font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase">
            Table {selectedTable.number}
          </span>
        </div>

        <QuestionDisplay
          questionText={question.questionText}
          optionA={question.optionA}
          optionB={question.optionB}
          optionC={question.optionC}
          optionD={question.optionD}
          selectedOption={selectedOption}
          onSelect={handleAnswer}
          disabled={answered}
          questionNumber={game.currentQuestion}
          totalQuestions={game.totalQuestions}
        />

        {answered && (
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Check className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-300 font-[family-name:var(--font-heading)] text-lg">
                Answer Locked In!
              </p>
            </div>
            <p className="text-gold-pale/50 text-xs">
              Waiting for other tables...
              {gameState.totalTables > 0 && (
                <span>
                  {" "}
                  ({gameState.answeredTables}/{gameState.totalTables} tables
                  answered)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Reveal ──
  if (game.status === "reveal" && question) {
    return (
      <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block bg-gold/10 border border-gold/30 px-4 py-1 text-gold font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase">
            Table {selectedTable.number}
          </span>
        </div>

        <QuestionDisplay
          questionText={question.questionText}
          optionA={question.optionA}
          optionB={question.optionB}
          optionC={question.optionC}
          optionD={question.optionD}
          correctOption={question.correctOption}
          selectedOption={tableAnswer?.chosenOption || selectedOption}
          questionNumber={game.currentQuestion}
          totalQuestions={game.totalQuestions}
        />

        {tableAnswer && (
          <div
            className={`mt-6 p-4 border text-center ${
              tableAnswer.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <p
              className={`font-[family-name:var(--font-heading)] text-xl ${
                tableAnswer.isCorrect ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {tableAnswer.isCorrect ? "Correct!" : "Wrong!"}
            </p>
            <p className="text-gold-pale/60 text-sm mt-1">
              +{tableAnswer.points} points for Table {selectedTable.number}
            </p>
          </div>
        )}

        {!tableAnswer && (
          <div className="mt-6 p-4 border border-gold/10 text-center">
            <p className="text-gold-pale/40 text-sm">
              Your table didn&apos;t answer this one
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Leaderboard / Finished ──
  if (game.status === "leaderboard" || game.status === "finished") {
    return (
      <div className="min-h-screen px-4 py-8">
        <Leaderboard
          entries={leaderboard}
          isFullScreen
          isFinal={game.status === "finished"}
        />

        {game.status === "leaderboard" && (
          <p className="text-center text-gold-pale/30 text-xs mt-8">
            Next question coming up...
          </p>
        )}

        {game.status === "finished" && (
          <p className="text-center text-gold-pale/40 text-sm mt-8">
            Thanks for playing!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gold-pale/40">Loading game...</p>
    </div>
  );
}
