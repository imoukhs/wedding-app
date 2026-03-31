"use client";

import { motion } from "framer-motion";

interface QuestionDisplayProps {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string | null;
  selectedOption?: string | null;
  onSelect?: (option: string) => void;
  disabled?: boolean;
  size?: "sm" | "lg";
  questionNumber?: number;
  totalQuestions?: number;
}

export function QuestionDisplay({
  questionText,
  optionA,
  optionB,
  optionC,
  optionD,
  correctOption,
  selectedOption,
  onSelect,
  disabled = false,
  size = "sm",
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  const options = [
    { key: "A", text: optionA },
    { key: "B", text: optionB },
    { key: "C", text: optionC },
    { key: "D", text: optionD },
  ];

  function getOptionStyle(key: string) {
    if (correctOption) {
      // Reveal mode
      if (key === correctOption) {
        return "border-emerald-500/60 bg-emerald-500/20 text-emerald-200";
      }
      if (key === selectedOption && key !== correctOption) {
        return "border-red-500/60 bg-red-500/15 text-red-300 line-through";
      }
      return "border-gold/10 bg-royal-purple/10 text-gold-pale/30";
    }
    // Voting mode
    if (key === selectedOption) {
      return "border-gold bg-gold/15 text-gold-light";
    }
    return "border-gold/20 bg-royal-purple/20 text-cream hover:border-gold/40 hover:bg-royal-purple/30";
  }

  const isLg = size === "lg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Question counter */}
      {questionNumber && totalQuestions && (
        <p className="text-gold-pale/40 text-xs text-center mb-2">
          Question {questionNumber} of {totalQuestions}
        </p>
      )}

      {/* Question text */}
      <h2
        className={`font-[family-name:var(--font-heading)] text-cream text-center mb-6 ${
          isLg ? "text-3xl leading-tight" : "text-xl"
        }`}
      >
        {questionText}
      </h2>

      {/* Options */}
      <div className={`grid ${isLg ? "grid-cols-2 gap-4" : "grid-cols-1 gap-3"}`}>
        {options.map(({ key, text }) => (
          <button
            key={key}
            onClick={() => !disabled && onSelect?.(key)}
            disabled={disabled || !!correctOption}
            className={`flex items-center gap-3 p-4 border transition-all text-left ${getOptionStyle(key)} ${
              disabled || correctOption ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm shrink-0 font-[family-name:var(--font-display)] ${
                key === correctOption
                  ? "border-emerald-400 bg-emerald-500/30 text-emerald-300"
                  : key === selectedOption
                    ? "border-gold bg-gold/20 text-gold-light"
                    : "border-gold/30 text-gold-pale/50"
              }`}
            >
              {key}
            </span>
            <span className={`${isLg ? "text-lg" : "text-sm"}`}>{text}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
