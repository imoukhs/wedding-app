"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Play,
  SkipForward,
  Trophy,
  Eye,
  Square,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from "lucide-react";
import {
  createTriviaGame,
  deleteTriviaGame,
  addTriviaQuestion,
  updateTriviaQuestion,
  deleteTriviaQuestion,
  startTriviaGame,
  advanceToReveal,
  advanceToLeaderboard,
  advanceToNextQuestion,
  endTriviaGame,
  getActiveGame,
  isTriviaOpen,
  setTriviaOpen,
} from "@/lib/actions/trivia-actions";

interface TriviaQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  order: number;
}

interface TriviaGame {
  id: string;
  status: string;
  currentQuestion: number;
  questions: TriviaQuestion[];
}

export function TriviaTab() {
  const [game, setGame] = useState<TriviaGame | null>(null);
  const [triviaOpen, setTriviaOpenState] = useState(false);
  const [isPending, startTransition] = useTransition();

  // New question form
  const [newQ, setNewQ] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [gameData, openData] = await Promise.all([
      getActiveGame(),
      isTriviaOpen(),
    ]);
    setGame(gameData);
    setTriviaOpenState(openData);
  }

  function handleCreateGame() {
    startTransition(async () => {
      const result = await createTriviaGame();
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Game created");
        await loadData();
      }
    });
  }

  function handleDeleteGame() {
    if (!game || !confirm("Delete this game and all its questions?")) return;
    startTransition(async () => {
      await deleteTriviaGame(game.id);
      await loadData();
      toast.success("Game deleted");
    });
  }

  function handleAddQuestion() {
    if (!game) return;
    if (!newQ.questionText || !newQ.optionA || !newQ.optionB || !newQ.optionC || !newQ.optionD) {
      toast.error("Fill in all fields");
      return;
    }
    startTransition(async () => {
      await addTriviaQuestion(game.id, newQ);
      setNewQ({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
      });
      await loadData();
      toast.success("Question added");
    });
  }

  function handleDeleteQuestion(qId: string) {
    startTransition(async () => {
      await deleteTriviaQuestion(qId);
      await loadData();
      toast.success("Question deleted");
    });
  }

  function handleUpdateQuestion(q: TriviaQuestion) {
    startTransition(async () => {
      await updateTriviaQuestion(q.id, {
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
      });
      toast.success("Updated");
    });
  }

  function handleToggleTrivia() {
    startTransition(async () => {
      await setTriviaOpen(!triviaOpen);
      setTriviaOpenState(!triviaOpen);
      toast.success(triviaOpen ? "Trivia closed" : "Trivia opened for guests");
    });
  }

  // Game control actions
  function handleStart() {
    if (!game) return;
    startTransition(async () => {
      const result = await startTriviaGame(game.id);
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Game started!");
        await loadData();
      }
    });
  }

  function handleReveal() {
    if (!game) return;
    startTransition(async () => {
      await advanceToReveal(game.id);
      await loadData();
    });
  }

  function handleLeaderboard() {
    if (!game) return;
    startTransition(async () => {
      await advanceToLeaderboard(game.id);
      await loadData();
    });
  }

  function handleNextQuestion() {
    if (!game) return;
    startTransition(async () => {
      await advanceToNextQuestion(game.id);
      await loadData();
    });
  }

  function handleEndGame() {
    if (!game || !confirm("End the game now?")) return;
    startTransition(async () => {
      await endTriviaGame(game.id);
      await loadData();
      toast.success("Game ended");
    });
  }

  return (
    <div>
      {/* Trivia Open Toggle */}
      <div className="flex items-center justify-between mb-6 bg-royal-purple/20 border border-gold/15 p-4">
        <div>
          <p className="text-cream font-[family-name:var(--font-heading)] text-lg">
            Trivia for Guests
          </p>
          <p className="text-gold-pale/50 text-xs">
            {triviaOpen
              ? "Guests can see the Trivia link in the menu"
              : "Trivia link is hidden from guests"}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleToggleTrivia}
          disabled={isPending}
          className="text-gold hover:text-gold-light"
        >
          {triviaOpen ? (
            <ToggleRight className="w-8 h-8" />
          ) : (
            <ToggleLeft className="w-8 h-8 opacity-50" />
          )}
        </Button>
      </div>

      {/* No game yet */}
      {!game && (
        <div className="text-center py-12">
          <p className="text-gold-pale/40 font-[family-name:var(--font-heading)] text-lg mb-4">
            No trivia game created
          </p>
          <Button
            onClick={handleCreateGame}
            disabled={isPending}
            className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Game
          </Button>
        </div>
      )}

      {/* Game exists */}
      {game && (
        <>
          {/* Game Controls */}
          <div className="bg-royal-purple/30 border border-gold/15 p-5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* Status info — full width on mobile */}
            <div className="mb-4">
              <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-gold">
                Game Control
              </p>
              <p className="text-gold-pale/50 text-sm mt-1">
                Status:{" "}
                <span className="text-gold-light capitalize">{game.status}</span>
                {game.status === "question" &&
                  ` — Question ${game.currentQuestion}/${game.questions.length}`}
                {game.status === "question" &&
                  " (auto-reveals when all tables answer)"}
              </p>
            </div>

            {/* Action buttons — wrap on mobile */}
            <div className="flex flex-wrap gap-2 mb-4">
              {game.status === "lobby" && (
                <Button
                  onClick={handleStart}
                  disabled={isPending || game.questions.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.15em] uppercase"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Start Game
                </Button>
              )}
              {game.status === "question" && (
                <Button
                  onClick={handleReveal}
                  disabled={isPending}
                  variant="outline"
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.15em] uppercase"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> Force Reveal
                </Button>
              )}
              {game.status === "reveal" && (
                <Button
                  onClick={handleLeaderboard}
                  disabled={isPending}
                  className="bg-gold hover:bg-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.15em] uppercase"
                >
                  <Trophy className="w-3.5 h-3.5 mr-1" /> Leaderboard
                </Button>
              )}
              {game.status === "leaderboard" && (
                <Button
                  onClick={handleNextQuestion}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.15em] uppercase"
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" />
                  {game.currentQuestion >= game.questions.length ? "End Game" : "Next Question"}
                </Button>
              )}
              {game.status !== "lobby" && game.status !== "finished" && (
                <Button
                  onClick={handleEndGame}
                  disabled={isPending}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.15em] uppercase"
                >
                  <Square className="w-3.5 h-3.5 mr-1" /> End Game
                </Button>
              )}
            </div>

            {/* MC Display link */}
            <a
              href="/admin/trivia-display"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gold-pale/50 hover:text-gold text-xs transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Open Projector Display
            </a>
          </div>

          {/* Questions List */}
          <div className="mb-6">
            <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-gold mb-4">
              Questions ({game.questions.length})
            </h3>

            <div className="space-y-3">
              {game.questions.map((q, i) => (
                <div
                  key={q.id}
                  className="bg-royal-purple/20 border border-gold/10 p-4 relative"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <span className="text-gold-pale/40 text-xs mr-2">
                        Q{i + 1}.
                      </span>
                      <Input
                        defaultValue={q.questionText}
                        onBlur={(e) =>
                          e.target.value !== q.questionText &&
                          handleUpdateQuestion({
                            ...q,
                            questionText: e.target.value,
                          })
                        }
                        className="bg-transparent border-none text-cream p-0 h-auto text-sm inline"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-400/40 hover:text-red-400 transition-colors p-2.5 -mr-1 -mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const key = `option${opt}` as keyof TriviaQuestion;
                      return (
                        <div
                          key={opt}
                          className={`flex items-center gap-2 px-2 py-1 border ${
                            q.correctOption === opt
                              ? "border-emerald-500/40 bg-emerald-500/10"
                              : "border-gold/10"
                          }`}
                        >
                          <button
                            onClick={() =>
                              handleUpdateQuestion({
                                ...q,
                                correctOption: opt,
                              })
                            }
                            className={`w-5 h-5 rounded-full border text-[0.6rem] flex items-center justify-center shrink-0 ${
                              q.correctOption === opt
                                ? "border-emerald-400 bg-emerald-500/30 text-emerald-300"
                                : "border-gold/30 text-gold-pale/40 hover:border-gold"
                            }`}
                          >
                            {opt}
                          </button>
                          <Input
                            defaultValue={q[key] as string}
                            onBlur={(e) =>
                              e.target.value !== q[key] &&
                              handleUpdateQuestion({
                                ...q,
                                [key]: e.target.value,
                              })
                            }
                            className="bg-transparent border-none text-cream/80 p-0 h-auto text-xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Question Form */}
          {game.status === "lobby" && (
            <div className="bg-royal-purple/20 border border-gold/15 p-5">
              <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-gold mb-4">
                Add Question
              </h3>

              <Input
                placeholder="Question text"
                value={newQ.questionText}
                onChange={(e) =>
                  setNewQ({ ...newQ, questionText: e.target.value })
                }
                className="bg-deep-purple/60 border-gold/25 text-cream placeholder:text-gold-pale/30 focus:border-gold mb-3"
              />

              <div className="grid grid-cols-2 gap-2 mb-3">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setNewQ({ ...newQ, correctOption: opt })
                      }
                      className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center shrink-0 ${
                        newQ.correctOption === opt
                          ? "border-emerald-400 bg-emerald-500/30 text-emerald-300"
                          : "border-gold/30 text-gold-pale/40 hover:border-gold"
                      }`}
                    >
                      {opt}
                    </button>
                    <Input
                      placeholder={`Option ${opt}`}
                      value={newQ[`option${opt}` as keyof typeof newQ]}
                      onChange={(e) =>
                        setNewQ({
                          ...newQ,
                          [`option${opt}`]: e.target.value,
                        })
                      }
                      className="bg-deep-purple/60 border-gold/25 text-cream placeholder:text-gold-pale/30 focus:border-gold text-sm"
                    />
                  </div>
                ))}
              </div>

              <p className="text-gold-pale/40 text-xs mb-3">
                Click the circle to mark the correct answer
              </p>

              <Button
                onClick={handleAddQuestion}
                disabled={isPending}
                className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Question
              </Button>
            </div>
          )}

          {/* Delete Game */}
          {game.status === "lobby" && (
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={handleDeleteGame}
                className="text-red-400/50 hover:text-red-400 text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Delete Game
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
