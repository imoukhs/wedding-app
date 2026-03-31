"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Settings ────────────────────────────────────────────────────────────────

export async function isTriviaOpen(): Promise<boolean> {
  const setting = await db.setting.findUnique({ where: { key: "triviaOpen" } });
  return setting?.value === "true";
}

export async function setTriviaOpen(open: boolean) {
  await db.setting.upsert({
    where: { key: "triviaOpen" },
    create: { key: "triviaOpen", value: open ? "true" : "false" },
    update: { value: open ? "true" : "false" },
  });
  revalidatePath("/admin");
}

// ─── Game CRUD ───────────────────────────────────────────────────────────────

export async function getActiveGame() {
  return db.triviaGame.findFirst({
    where: { status: { not: "finished" } },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });
}

export async function getAllGames() {
  return db.triviaGame.findMany({
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { answers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTriviaGame() {
  const existing = await db.triviaGame.findFirst({
    where: { status: { not: "finished" } },
  });
  if (existing) {
    return { error: "A game is already active. End it first." };
  }

  const game = await db.triviaGame.create({ data: {} });

  // Seed with sample questions
  const sampleQuestions = [
    { questionText: "Where did the couple first meet?", optionA: "At church", optionB: "At a party", optionC: "At school", optionD: "Online", correctOption: "B" },
    { questionText: "What year did they start dating?", optionA: "2018", optionB: "2019", optionC: "2020", optionD: "2021", correctOption: "C" },
    { questionText: "What is the bride's favorite food?", optionA: "Jollof Rice", optionB: "Pounded Yam", optionC: "Fried Rice", optionD: "Pasta", correctOption: "A" },
    { questionText: "What is the groom's middle name?", optionA: "David", optionB: "Samuel", optionC: "Michael", optionD: "Daniel", correctOption: "B" },
    { questionText: "Who said 'I love you' first?", optionA: "The Bride", optionB: "The Groom", optionC: "Both at the same time", optionD: "Neither has yet", correctOption: "B" },
    { questionText: "Where was their first date?", optionA: "A restaurant", optionB: "The cinema", optionC: "The beach", optionD: "A park", correctOption: "A" },
    { questionText: "What is the bride's guilty pleasure show?", optionA: "Love Island", optionB: "Real Housewives", optionC: "Bridgerton", optionD: "The Bachelor", correctOption: "C" },
    { questionText: "How did the groom propose?", optionA: "At home", optionB: "On vacation", optionC: "At a restaurant", optionD: "It's a secret", correctOption: "B" },
    { questionText: "What sport does the groom love?", optionA: "Football", optionB: "Basketball", optionC: "Tennis", optionD: "None", correctOption: "A" },
    { questionText: "Where is the couple going for their honeymoon?", optionA: "Dubai", optionB: "Maldives", optionC: "Paris", optionD: "It's a surprise!", correctOption: "D" },
  ];

  for (let i = 0; i < sampleQuestions.length; i++) {
    await db.triviaQuestion.create({
      data: { ...sampleQuestions[i], gameId: game.id, order: i + 1 },
    });
  }

  revalidatePath("/admin");
  return game;
}

export async function deleteTriviaGame(gameId: string) {
  await db.triviaGame.delete({ where: { id: gameId } });
  revalidatePath("/admin");
}

// ─── Question CRUD ───────────────────────────────────────────────────────────

export async function addTriviaQuestion(
  gameId: string,
  data: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
  }
) {
  const maxOrder = await db.triviaQuestion.aggregate({
    where: { gameId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const question = await db.triviaQuestion.create({
    data: { ...data, gameId, order: nextOrder },
  });
  revalidatePath("/admin");
  return question;
}

export async function updateTriviaQuestion(
  questionId: string,
  data: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
  }
) {
  await db.triviaQuestion.update({ where: { id: questionId }, data });
  revalidatePath("/admin");
}

export async function deleteTriviaQuestion(questionId: string) {
  await db.triviaQuestion.delete({ where: { id: questionId } });
  revalidatePath("/admin");
}

// ─── Game Control (MC) ──────────────────────────────────────────────────────

export async function startTriviaGame(gameId: string) {
  const game = await db.triviaGame.findUnique({
    where: { id: gameId },
    include: { questions: true },
  });
  if (!game || game.questions.length === 0) {
    return { error: "No questions added" };
  }

  await db.triviaGame.update({
    where: { id: gameId },
    data: {
      status: "question",
      currentQuestion: 1,
      timerEndsAt: null,
    },
  });
  revalidatePath("/admin");
}

export async function advanceToReveal(gameId: string) {
  const game = await db.triviaGame.findUnique({
    where: { id: gameId },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!game || game.status !== "question") return;

  const currentQ = game.questions[game.currentQuestion - 1];
  if (!currentQ) return;

  // Get all table answers (one per table — submitted directly, no vote aggregation needed)
  const answers = await db.triviaAnswer.findMany({
    where: { gameId, questionId: currentQ.id },
  });

  // Score each answer: 100 points for correct, 0 for wrong
  // (No speed bonus since no timer)
  for (const answer of answers) {
    const isCorrect = answer.chosenOption === currentQ.correctOption;
    await db.triviaAnswer.update({
      where: { id: answer.id },
      data: { isCorrect, points: isCorrect ? 100 : 0 },
    });
  }

  await db.triviaGame.update({
    where: { id: gameId },
    data: { status: "reveal" },
  });
  revalidatePath("/admin");
}

export async function advanceToLeaderboard(gameId: string) {
  await db.triviaGame.update({
    where: { id: gameId },
    data: { status: "leaderboard" },
  });
  revalidatePath("/admin");
}

export async function advanceToNextQuestion(gameId: string) {
  const game = await db.triviaGame.findUnique({
    where: { id: gameId },
    include: { questions: true },
  });
  if (!game) return;

  const nextQ = game.currentQuestion + 1;
  if (nextQ > game.questions.length) {
    await db.triviaGame.update({
      where: { id: gameId },
      data: { status: "finished" },
    });
  } else {
    await db.triviaGame.update({
      where: { id: gameId },
      data: {
        status: "question",
        currentQuestion: nextQ,
        timerEndsAt: null,
      },
    });
  }
  revalidatePath("/admin");
}

export async function endTriviaGame(gameId: string) {
  await db.triviaGame.update({
    where: { id: gameId },
    data: { status: "finished", timerEndsAt: null },
  });
  revalidatePath("/admin");
}

// ─── Table Answer Submission ─────────────────────────────────────────────────

export async function submitTableAnswer(data: {
  gameId: string;
  questionId: string;
  tableUniqueId: string;
  option: string;
}) {
  const table = await db.weddingTable.findUnique({
    where: { uniqueId: data.tableUniqueId },
  });
  if (!table) return { error: "Table not found" };

  const game = await db.triviaGame.findUnique({ where: { id: data.gameId } });
  if (!game || game.status !== "question") {
    return { error: "Voting is not open" };
  }

  // Check if table already answered
  const existing = await db.triviaAnswer.findUnique({
    where: {
      questionId_tableId: { questionId: data.questionId, tableId: table.id },
    },
  });
  if (existing) {
    return { error: "Your table already answered!" };
  }

  // Submit the table's answer
  await db.triviaAnswer.create({
    data: {
      gameId: data.gameId,
      questionId: data.questionId,
      tableId: table.id,
      chosenOption: data.option,
      isCorrect: false, // Will be scored on reveal
      points: 0,
    },
  });

  // Check if all tables have answered → auto-advance to reveal
  const totalTables = await db.weddingTable.count({
    where: { orders: { some: {} } }, // Only tables that have guests (placed orders)
  });
  const totalAnswers = await db.triviaAnswer.count({
    where: { gameId: data.gameId, questionId: data.questionId },
  });

  if (totalAnswers >= totalTables) {
    // All tables answered — auto-reveal
    await advanceToReveal(data.gameId);
  }

  revalidatePath("/admin");
  return { success: true };
}

// ─── Polling / Read ──────────────────────────────────────────────────────────

export async function getTriviaGameState() {
  const game = await db.triviaGame.findFirst({
    where: { status: { not: "finished" } },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!game) {
    // Check for a recently finished game
    const finishedGame = await db.triviaGame.findFirst({
      where: { status: "finished" },
      orderBy: { updatedAt: "desc" },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });
    if (finishedGame) {
      const leaderboard = await getTriviaLeaderboard(finishedGame.id);
      return {
        game: {
          id: finishedGame.id,
          status: finishedGame.status,
          currentQuestion: finishedGame.currentQuestion,
          totalQuestions: finishedGame.questions.length,
        },
        question: null,
        leaderboard,
        answeredTables: 0,
        totalTables: 0,
        serverTime: new Date().toISOString(),
      };
    }
    return null;
  }

  const currentQ =
    game.currentQuestion > 0
      ? game.questions[game.currentQuestion - 1]
      : null;

  const questionData = currentQ
    ? {
        id: currentQ.id,
        questionText: currentQ.questionText,
        optionA: currentQ.optionA,
        optionB: currentQ.optionB,
        optionC: currentQ.optionC,
        optionD: currentQ.optionD,
        correctOption:
          game.status === "reveal" ||
          game.status === "leaderboard" ||
          game.status === "finished"
            ? currentQ.correctOption
            : null,
      }
    : null;

  const leaderboard =
    game.status === "leaderboard" ||
    game.status === "finished" ||
    game.status === "reveal"
      ? await getTriviaLeaderboard(game.id)
      : [];

  // How many tables have answered the current question
  let answeredTables = 0;
  let totalTables = 0;
  if (currentQ && game.status === "question") {
    answeredTables = await db.triviaAnswer.count({
      where: { gameId: game.id, questionId: currentQ.id },
    });
    totalTables = await db.weddingTable.count({
      where: { orders: { some: {} } },
    });
  }

  return {
    game: {
      id: game.id,
      status: game.status,
      currentQuestion: game.currentQuestion,
      totalQuestions: game.questions.length,
    },
    question: questionData,
    leaderboard,
    answeredTables,
    totalTables,
    serverTime: new Date().toISOString(),
  };
}

export async function getTriviaLeaderboard(gameId: string) {
  const answers = await db.triviaAnswer.findMany({
    where: { gameId },
    include: { table: true },
  });

  const tableScores: Record<
    string,
    { tableId: string; tableNumber: number; totalPoints: number; correct: number; total: number }
  > = {};

  for (const answer of answers) {
    if (!tableScores[answer.tableId]) {
      tableScores[answer.tableId] = {
        tableId: answer.tableId,
        tableNumber: answer.table.number,
        totalPoints: 0,
        correct: 0,
        total: 0,
      };
    }
    tableScores[answer.tableId].totalPoints += answer.points;
    tableScores[answer.tableId].total++;
    if (answer.isCorrect) tableScores[answer.tableId].correct++;
  }

  return Object.values(tableScores).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );
}

export async function getTableAnswerForQuestion(
  gameId: string,
  questionId: string,
  tableUniqueId: string
) {
  const table = await db.weddingTable.findUnique({
    where: { uniqueId: tableUniqueId },
  });
  if (!table) return null;

  return db.triviaAnswer.findUnique({
    where: { questionId_tableId: { questionId, tableId: table.id } },
  });
}

export async function hasTableAnswered(
  gameId: string,
  questionId: string,
  tableUniqueId: string
) {
  const table = await db.weddingTable.findUnique({
    where: { uniqueId: tableUniqueId },
  });
  if (!table) return false;

  const answer = await db.triviaAnswer.findUnique({
    where: { questionId_tableId: { questionId, tableId: table.id } },
  });
  return !!answer;
}
