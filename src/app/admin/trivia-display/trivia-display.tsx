"use client";

import { useState, useEffect, useCallback } from "react";
import { Gamepad2, Users } from "lucide-react";
import { QuestionDisplay } from "@/components/trivia/question-display";
import { Leaderboard } from "@/components/trivia/leaderboard";
import { getTriviaGameState } from "@/lib/actions/trivia-actions";

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

export function TriviaDisplay() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const poll = useCallback(async () => {
    const state = await getTriviaGameState();
    setGameState(state);
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [poll]);

  // ── No game ──
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-purple">
        <div className="text-center">
          <Gamepad2 className="w-20 h-20 text-gold/30 mx-auto mb-6" />
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-gold-pale/40">
            Waiting for Game
          </h1>
        </div>
      </div>
    );
  }

  const { game, question, leaderboard } = gameState;

  // ── Lobby ──
  if (game.status === "lobby") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-purple px-8">
        <div className="text-center">
          <Gamepad2 className="w-20 h-20 text-gold mx-auto mb-6 animate-pulse" />
          <h1 className="font-[family-name:var(--font-heading)] text-6xl text-gold-light mb-4">
            Table Trivia
          </h1>
          <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.3em] uppercase text-gold-pale/60">
            {game.totalQuestions} Questions &middot; Get Ready!
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="block h-px w-16 bg-gradient-to-r from-transparent to-gold/30" />
            <span className="text-gold text-sm">&#10022;</span>
            <span className="block h-px w-16 bg-gradient-to-l from-transparent to-gold/30" />
          </div>
          <p className="text-gold-pale/40 text-sm mt-4">
            Open Trivia on your phone to join your table
          </p>
        </div>
      </div>
    );
  }

  // ── Question ──
  if (game.status === "question" && question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-deep-purple px-8 py-12">
        {/* Answer progress */}
        {gameState.totalTables > 0 && (
          <div className="mb-8 flex items-center gap-3 bg-royal-purple/30 border border-gold/15 px-6 py-3">
            <Users className="w-5 h-5 text-gold" />
            <span className="font-[family-name:var(--font-heading)] text-2xl text-gold-light">
              {gameState.answeredTables}/{gameState.totalTables}
            </span>
            <span className="text-gold-pale/50 text-sm">tables answered</span>
          </div>
        )}

        <div className="w-full max-w-3xl">
          <QuestionDisplay
            questionText={question.questionText}
            optionA={question.optionA}
            optionB={question.optionB}
            optionC={question.optionC}
            optionD={question.optionD}
            disabled
            size="lg"
            questionNumber={game.currentQuestion}
            totalQuestions={game.totalQuestions}
          />
        </div>
      </div>
    );
  }

  // ── Reveal ──
  if (game.status === "reveal" && question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-deep-purple px-8 py-12">
        <div className="w-full max-w-3xl">
          <QuestionDisplay
            questionText={question.questionText}
            optionA={question.optionA}
            optionB={question.optionB}
            optionC={question.optionC}
            optionD={question.optionD}
            correctOption={question.correctOption}
            disabled
            size="lg"
            questionNumber={game.currentQuestion}
            totalQuestions={game.totalQuestions}
          />
        </div>
      </div>
    );
  }

  // ── Leaderboard / Finished ──
  if (game.status === "leaderboard" || game.status === "finished") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-purple px-8 py-12">
        <div className="w-full max-w-2xl">
          <Leaderboard
            entries={leaderboard}
            isFullScreen
            isFinal={game.status === "finished"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-purple">
      <p className="text-gold-pale/40 text-xl">Loading...</p>
    </div>
  );
}
