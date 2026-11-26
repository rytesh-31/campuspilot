import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { generateQuizQuestions } from '../../data/questionBank';
import { QuizDifficulty, QuizQuestion } from '../../types/academic';
import { formatRelativeTimestamp } from '../../utils/dateUtils';

type QuizPhase = 'configure' | 'active' | 'results';

export const QuizView: React.FC = () => {
  const { data, quickAction, setQuickAction, recordQuizAttempt } = useWorkspace();

  const [phase, setPhase] = useState<QuizPhase>('configure');
  const [subjectName, setSubjectName] = useState<string>('ALL');
  const [topicQuery, setTopicQuery] = useState<string>('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty | 'mixed'>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [validationMsg, setValidationMsg] = useState('');

  useEffect(() => {
    if (quickAction === 'generate-quiz') {
      setPhase('configure');
      setQuickAction(null);
    }
  }, [quickAction]);

  const subjectOptions = useMemo(() => {
    const names = new Set<string>();
    data.subjects.forEach((s) => names.add(s.name));
    names.add('Data Structures & Algorithms');
    names.add('Linear Algebra & Vector Calculus');
    names.add('Thermodynamics & Statistical Mechanics');
    names.add('Modern Economic History');
    return Array.from(names);
  }, [data.subjects]);

  const handleStartQuiz = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const generated = generateQuizQuestions({
      subjectName,
      topicQuery,
      difficulty,
      count: questionCount,
    });
    setQuestions(generated);
    setCurrentIndex(0);
    setAnswers({});
    setValidationMsg('');
    setPhase('active');
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    setValidationMsg('');
  };

  const handleSubmitQuiz = () => {
    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setValidationMsg(
        `Please answer all questions before submitting (${unanswered.length} remaining).`,
      );
      return;
    }

    const score = questions.reduce(
      (sum, q) => (answers[q.id] === q.correctIndex ? sum + 1 : sum),
      0,
    );

    recordQuizAttempt({
      subjectName: subjectName === 'ALL' ? 'Mixed Subjects' : subjectName,
      topic: topicQuery.trim() || 'General Review',
      difficulty,
      totalQuestions: questions.length,
      score,
      questionIds: questions.map((q) => q.id),
      answers,
    });

    setPhase('results');
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setValidationMsg('');
    setPhase('active');
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const finalScore = useMemo(() => {
    return questions.reduce(
      (sum, q) => (answers[q.id] === q.correctIndex ? sum + 1 : sum),
      0,
    );
  }, [questions, answers]);

  return (
    <div className="max-w-[980px] mx-auto space-y-6">
      {phase === 'configure' && (
        <>
          <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2A2C30]">
              <div>
                <h2 className="text-[16px] font-semibold text-[#F2F2F2]">
                  Configure Practice Quiz
                </h2>
                <p className="text-[13px] text-[#92959D] mt-0.5">
                  Test comprehension using the built-in academic question bank.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#92959D]">
                <Sparkles className="w-3.5 h-3.5 text-[#91A5D5]" />
                <span>AI generation ready for future release</span>
              </div>
            </div>

            <form onSubmit={handleStartQuiz} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                    Subject
                  </label>
                  <select
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
                  >
                    <option value="ALL">All Subjects (Mixed)</option>
                    {subjectOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                    Topic Focus (Optional)
                  </label>
                  <input
                    type="text"
                    value={topicQuery}
                    onChange={(e) => setTopicQuery(e.target.value)}
                    placeholder="e.g. Dynamic Programming, Entropy, SVD..."
                    className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] placeholder:text-[#92959D]/60 focus:outline-none focus:border-[#91A5D5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#101113] border border-[#2A2C30] rounded-md">
                    {(['mixed', 'easy', 'medium', 'hard'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`py-1.5 text-[12px] font-medium rounded capitalize transition-colors ${
                          difficulty === d
                            ? 'bg-[#222429] text-[#F2F2F2]'
                            : 'text-[#92959D] hover:text-[#F2F2F2]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                    Question Count
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#101113] border border-[#2A2C30] rounded-md">
                    {[3, 5, 8, 10].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`py-1.5 text-[12px] font-medium rounded tabular-nums transition-colors ${
                          questionCount === count
                            ? 'bg-[#222429] text-[#F2F2F2]'
                            : 'text-[#92959D] hover:text-[#F2F2F2]'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="h-9 px-5 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium flex items-center gap-2 transition-colors"
                >
                  <BookOpenCheck className="w-4 h-4" />
                  Start Quiz
                </button>
              </div>
            </form>
          </section>

          {/* Quiz History */}
          <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#2A2C30] flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#F2F2F2]">
                Recent Quiz Attempts
              </h3>
              <span className="text-[12px] text-[#92959D] tabular-nums">
                {data.quizAttempts.length} recorded
              </span>
            </div>

            {data.quizAttempts.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-[#92959D]">
                Complete a quiz to track accuracy and topic mastery over time.
              </div>
            ) : (
              <div className="divide-y divide-[#2A2C30]">
                {data.quizAttempts.slice(0, 6).map((attempt) => {
                  const pct = Math.round(
                    (attempt.score / Math.max(1, attempt.totalQuestions)) * 100,
                  );
                  return (
                    <div
                      key={attempt.id}
                      className="px-5 py-3 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#F2F2F2] truncate">
                          {attempt.subjectName}
                        </div>
                        <div className="text-[12px] text-[#92959D] mt-0.5">
                          {attempt.topic} ·{' '}
                          <span className="capitalize">{attempt.difficulty}</span> ·{' '}
                          {formatRelativeTimestamp(attempt.completedAt)}
                        </div>
                      </div>

                      <div className="text-right shrink-0 tabular-nums">
                        <div
                          className={`text-[13px] font-semibold ${
                            pct >= 75
                              ? 'text-[#5FA876]'
                              : pct >= 50
                                ? 'text-[#D49A45]'
                                : 'text-[#D06A6A]'
                          }`}
                        >
                          {attempt.score}/{attempt.totalQuestions} ({pct}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {phase === 'active' && currentQuestion && (
        <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 sm:p-6 space-y-5">
          {/* Header & Progress */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[12px] text-[#92959D] tabular-nums">
              <span className="text-[#F2F2F2] font-medium">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="mx-2">·</span>
              <span>{currentQuestion.subjectName}</span>
              <span className="mx-2">·</span>
              <span className="capitalize">{currentQuestion.difficulty}</span>
            </div>

            <button
              type="button"
              onClick={() => setPhase('configure')}
              className="text-[12px] text-[#92959D] hover:text-[#F2F2F2]"
            >
              Exit Quiz
            </button>
          </div>

          <div className="h-1.5 w-full bg-[#222429] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#91A5D5] transition-all duration-200"
              style={{
                width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%`,
              }}
            />
          </div>

          {/* Question Navigator */}
          <div className="flex flex-wrap items-center gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded text-[12px] font-mono tabular-nums border transition-colors ${
                    isCurrent
                      ? 'bg-[#91A5D5] border-[#91A5D5] text-[#101113] font-semibold'
                      : isAnswered
                        ? 'bg-[#222429] border-[#91A5D5]/40 text-[#F2F2F2]'
                        : 'bg-[#161719] border-[#2A2C30] text-[#92959D]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Stem & Options */}
          <div className="pt-2 space-y-4">
            <div className="text-[12px] text-[#91A5D5]">
              {currentQuestion.topic}
            </div>
            <h3 className="text-[17px] font-medium text-[#F2F2F2] leading-relaxed">
              {currentQuestion.question}
            </h3>

            <div className="space-y-2.5 pt-1">
              {currentQuestion.options.map((opt, idx) => {
                const selected = answers[currentQuestion.id] === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, idx)}
                    className={`w-full px-4 py-3 rounded-md border text-left flex items-start gap-3 transition-colors ${
                      selected
                        ? 'bg-[#91A5D5]/12 border-[#91A5D5] text-[#F2F2F2]'
                        : 'bg-[#161719] border-[#2A2C30] text-[#F2F2F2]/90 hover:bg-[#222429]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded text-[12px] font-mono flex items-center justify-center shrink-0 border ${
                        selected
                          ? 'bg-[#91A5D5] border-[#91A5D5] text-[#101113] font-semibold'
                          : 'border-[#2A2C30] text-[#92959D]'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-[14px] leading-snug pt-0.5">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {validationMsg && (
            <div className="px-3.5 py-2 rounded bg-[#D49A45]/10 border border-[#D49A45]/40 text-[12px] text-[#D49A45]">
              {validationMsg}
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-[#2A2C30] flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="px-3.5 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] disabled:opacity-40 disabled:cursor-not-allowed text-[13px] font-medium text-[#F2F2F2] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-[12px] text-[#92959D] tabular-nums">
              {answeredCount} / {questions.length} answered
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                className="px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center gap-1.5"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="px-5 py-2 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </section>
      )}

      {phase === 'results' && (
        <div className="space-y-5">
          {/* Score Summary */}
          <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[12px] text-[#92959D]">Performance Summary</div>
              <h2 className="mt-1 text-[24px] font-semibold text-[#F2F2F2] tabular-nums">
                {finalScore} / {questions.length} correct (
                {Math.round((finalScore / Math.max(1, questions.length)) * 100)}%)
              </h2>
              <p className="text-[13px] text-[#92959D] mt-1">
                {finalScore === questions.length
                  ? 'Strong mastery across all selected questions.'
                  : finalScore >= Math.ceil(questions.length * 0.7)
                    ? 'Solid grasp of core concepts. Review the missed explanations below.'
                    : 'Good diagnostic run. Focus your next study block on the topics below.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-md bg-[#222429] hover:bg-[#2A2C30] border border-[#2A2C30] text-[13px] font-medium text-[#F2F2F2] flex items-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>
              <button
                type="button"
                onClick={() => setPhase('configure')}
                className="px-4 py-2 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium whitespace-nowrap"
              >
                New Quiz
              </button>
            </div>
          </section>

          {/* Answer Breakdown */}
          <section className="space-y-3">
            {questions.map((q, idx) => {
              const userChoice = answers[q.id];
              const isCorrect = userChoice === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[12px] text-[#92959D]">
                      Question {idx + 1} · {q.subjectName} · {q.topic}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[12px] font-medium shrink-0 ${
                        isCorrect ? 'text-[#5FA876]' : 'text-[#D06A6A]'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-[14px] font-medium text-[#F2F2F2]">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                    <div className="p-2.5 rounded bg-[#161719] border border-[#2A2C30]">
                      <div className="text-[11px] text-[#92959D]">Your answer</div>
                      <div
                        className={`mt-0.5 ${
                          isCorrect ? 'text-[#5FA876]' : 'text-[#D06A6A]'
                        }`}
                      >
                        {userChoice !== undefined ? q.options[userChoice] : 'None'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-[#161719] border border-[#2A2C30]">
                      <div className="text-[11px] text-[#92959D]">Correct answer</div>
                      <div className="mt-0.5 text-[#5FA876]">
                        {q.options[q.correctIndex]}
                      </div>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#92959D] leading-relaxed pt-1 border-t border-[#2A2C30]">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
};
