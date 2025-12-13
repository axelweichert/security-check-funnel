import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { t, type Language } from './i18n';
// --- TYPES ---
export type AnswerId = string;
export type QuestionId = 'L1-A' | 'L1-B' | 'L1-C' | 'L2-A1' | 'L2-A2' | 'L2-B1' | 'L2-B2' | 'L2-C1' | 'L3-A1' | 'L3-A1-ALT' | 'L3-B1' | 'L3-C1';
export interface Answer {
  id: AnswerId;
  text: string;
  score: number;
}
export interface Question {
  id: QuestionId;
  text: string;
  subtext?: string;
  options: Answer[];
}
export type AnswersState = Record<QuestionId, AnswerId | ''>;
export interface FunnelState {
  answers: AnswersState;
  setAnswer: (questionId: QuestionId, answerId: AnswerId) => void;
  reset: () => void;
}
// --- INITIAL STATE & STORE ---
const initialAnswers: AnswersState = {
  'L1-A': '', 'L1-B': '', 'L1-C': '',
  'L2-A1': '', 'L2-A2': '', 'L2-B1': '', 'L2-B2': '', 'L2-C1': '',
  'L3-A1': '', 'L3-A1-ALT': '', 'L3-B1': '', 'L3-C1': '',
};
export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
      answers: initialAnswers,
      setAnswer: (questionId, answerId) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answerId },
        })),
      reset: () => set({ answers: initialAnswers }),
    }),
    {
      name: 'vonbusch-funnel-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
// --- QUESTIONS DATA ---
export function getQuestions(lang: Language): Record<QuestionId, Question> {
  return {
    'L1-A': {
      id: 'L1-A',
      text: t(lang, 'L1-A-text'),
      options: [
        { id: 'L1-A-1', text: t(lang, 'L1-A-1'), score: 2 },
        { id: 'L1-A-2', text: t(lang, 'L1-A-2'), score: 1 },
        { id: 'L1-A-3', text: t(lang, 'L1-A-3'), score: 0 },
        { id: 'L1-A-4', text: t(lang, 'L1-A-4'), score: 0 },
      ],
    },
    'L1-B': {
      id: 'L1-B',
      text: t(lang, 'L1-B-text'),
      subtext: t(lang, 'L1-B-subtext'),
      options: [
        { id: 'L1-B-1', text: t(lang, 'L1-B-1'), score: 2 },
        { id: 'L1-B-2', text: t(lang, 'L1-B-2'), score: 1 },
        { id: 'L1-B-3', text: t(lang, 'L1-B-3'), score: 0 },
        { id: 'L1-B-4', text: t(lang, 'L1-B-4'), score: 0 },
      ],
    },
    'L1-C': {
      id: 'L1-C',
      text: t(lang, 'L1-C-text'),
      options: [
        { id: 'L1-C-1', text: t(lang, 'L1-C-1'), score: 2 },
        { id: 'L1-C-2', text: t(lang, 'L1-C-2'), score: 1 },
        { id: 'L1-C-3', text: t(lang, 'L1-C-3'), score: 0 },
        { id: 'L1-C-4', text: t(lang, 'L1-C-4'), score: 0 },
      ],
    },
    'L2-A1': {
      id: 'L2-A1',
      text: t(lang, 'L2-A1-text'),
      options: [
        { id: 'L2-A1-1', text: t(lang, 'L2-A1-1'), score: 1 },
        { id: 'L2-A1-2', text: t(lang, 'L2-A1-2'), score: 2 },
        { id: 'L2-A1-3', text: t(lang, 'L2-A1-3'), score: 1 },
        { id: 'L2-A1-4', text: t(lang, 'L2-A1-4'), score: 0 },
      ],
    },
    'L2-A2': {
      id: 'L2-A2',
      text: t(lang, 'L2-A2-text'),
      options: [
        { id: 'L2-A2-1', text: t(lang, 'L2-A2-1'), score: 0 },
        { id: 'L2-A2-2', text: t(lang, 'L2-A2-2'), score: 1 },
        { id: 'L2-A2-3', text: t(lang, 'L2-A2-3'), score: 2 },
      ],
    },
    'L2-B1': {
      id: 'L2-B1',
      text: t(lang, 'L2-B1-text'),
      options: [
        { id: 'L2-B1-1', text: t(lang, 'L2-B1-1'), score: 0 },
        { id: 'L2-B1-2', text: t(lang, 'L2-B1-2'), score: 1 },
        { id: 'L2-B1-3', text: t(lang, 'L2-B1-3'), score: 1 },
        { id: 'L2-B1-4', text: t(lang, 'L2-B1-4'), score: 0 },
      ],
    },
    'L2-B2': {
      id: 'L2-B2',
      text: t(lang, 'L2-B2-text'),
      options: [
        { id: 'L2-B2-1', text: t(lang, 'L2-B2-1'), score: 2 },
        { id: 'L2-B2-2', text: t(lang, 'L2-B2-2'), score: 1 },
        { id: 'L2-B2-3', text: t(lang, 'L2-B2-3'), score: 0 },
        { id: 'L2-B2-4', text: t(lang, 'L2-B2-4'), score: 0 },
      ],
    },
    'L2-C1': {
      id: 'L2-C1',
      text: t(lang, 'L2-C1-text'),
      subtext: t(lang, 'L2-C1-subtext'),
      options: [
        { id: 'L2-C1-1', text: t(lang, 'L2-C1-1'), score: 0 },
        { id: 'L2-C1-2', text: t(lang, 'L2-C1-2'), score: 1 },
        { id: 'L2-C1-3', text: t(lang, 'L2-C1-3'), score: 2 },
        { id: 'L2-C1-4', text: t(lang, 'L2-C1-4'), score: 0 },
      ],
    },
    'L3-A1': {
      id: 'L3-A1',
      text: t(lang, 'L3-A1-text'),
      options: [
        { id: 'L3-A1-1', text: t(lang, 'L3-A1-1'), score: 2 },
        { id: 'L3-A1-2', text: t(lang, 'L3-A1-2'), score: 1 },
        { id: 'L3-A1-3', text: t(lang, 'L3-A1-3'), score: 0 },
      ],
    },
    'L3-A1-ALT': {
      id: 'L3-A1-ALT',
      text: t(lang, 'L3-A1-ALT-text'),
      options: [
        { id: 'L3-A1-ALT-1', text: t(lang, 'L3-A1-ALT-1'), score: 0 },
        { id: 'L3-A1-ALT-2', text: t(lang, 'L3-A1-ALT-2'), score: 0 },
        { id: 'L3-A1-ALT-3', text: t(lang, 'L3-A1-ALT-3'), score: 1 },
      ],
    },
    'L3-B1': {
      id: 'L3-B1',
      text: t(lang, 'L3-B1-text'),
      subtext: t(lang, 'L3-B1-subtext'),
      options: [
        { id: 'L3-B1-1', text: t(lang, 'L3-B1-1'), score: 2 },
        { id: 'L3-B1-2', text: t(lang, 'L3-B1-2'), score: 1 },
        { id: 'L3-B1-3', text: t(lang, 'L3-B1-3'), score: 0 },
        { id: 'L3-B1-4', text: t(lang, 'L3-B1-4'), score: 0 },
      ],
    },
    'L3-C1': {
      id: 'L3-C1',
      text: t(lang, 'L3-C1-text'),
      options: [
        { id: 'L3-C1-1', text: t(lang, 'L3-C1-1'), score: 0 },
        { id: 'L3-C1-2', text: t(lang, 'L3-C1-2'), score: 1 },
        { id: 'L3-C1-3', text: t(lang, 'L3-C1-3'), score: 2 },
        { id: 'L3-C1-4', text: t(lang, 'L3-C1-4'), score: 0 },
      ],
    },
  };
}
// --- SCORING LOGIC ---
function getScoreForAnswer(lang: Language, questionId: QuestionId, answerId: AnswerId | null): number {
  if (!answerId) return 0;
  const questions = getQuestions(lang);
  const question = questions[questionId];
  const answer = question.options.find(opt => opt.id === answerId);
  return answer ? answer.score : 0;
}
export interface AreaScores {
  areaA: number;
  areaB: number;
  areaC: number;
}
export function computeAreaScores(answers: AnswersState, lang: Language): AreaScores {
  const scoreA = getScoreForAnswer(lang, 'L1-A', answers['L1-A']) +
                 getScoreForAnswer(lang, 'L2-A1', answers['L2-A1']) +
                 getScoreForAnswer(lang, 'L2-A2', answers['L2-A2']) +
                 (answers['L1-A'] === 'L1-A-1' || answers['L1-A'] === 'L1-A-2'
                   ? getScoreForAnswer(lang, 'L3-A1', answers['L3-A1'])
                   : getScoreForAnswer(lang, 'L3-A1-ALT', answers['L3-A1-ALT']));
  const scoreB = getScoreForAnswer(lang, 'L1-B', answers['L1-B']) +
                 getScoreForAnswer(lang, 'L2-B1', answers['L2-B1']) +
                 getScoreForAnswer(lang, 'L2-B2', answers['L2-B2']) +
                 getScoreForAnswer(lang, 'L3-B1', answers['L3-B1']);
  const scoreC = getScoreForAnswer(lang, 'L1-C', answers['L1-C']) +
                 getScoreForAnswer(lang, 'L2-C1', answers['L2-C1']) +
                 getScoreForAnswer(lang, 'L3-C1', answers['L3-C1']);
  return {
    areaA: Math.min(6, scoreA),
    areaB: Math.min(6, scoreB),
    areaC: Math.min(6, scoreC),
  };
}
export function computeAverageScore(areaScores: AreaScores): number {
  const totalScore = areaScores.areaA + areaScores.areaB + areaScores.areaC;
  return totalScore / 3;
}
export type MaturityLevel = 'high' | 'medium' | 'low';
export type ResultLabel = {
  level: MaturityLevel;
  text: string;
  color: string;
  bgColor: string;
};
export function deriveAreaLabel(score: number, lang: Language): ResultLabel {
  if (score >= 5) {
    return { level: 'high', text: t(lang, 'maturityHigh'), color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/50' };
  }
  if (score >= 3) {
    return { level: 'medium', text: t(lang, 'maturityMedium'), color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' };
  }
  return { level: 'low', text: t(lang, 'maturityLow'), color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/50' };
}
export function deriveOverallLabel(averageScore: number, lang: Language): { headline: string; summary: string } {
  if (averageScore >= 4.5) {
    return {
      headline: t(lang, 'resultsHeadlineHigh'),
      summary: t(lang, 'resultsSummaryHigh')
    };
  }
  if (averageScore >= 2.5) {
    return {
      headline: t(lang, 'resultsHeadlineMedium'),
      summary: t(lang, 'resultsSummaryMedium')
    };
  }
  return {
    headline: t(lang, 'resultsHeadlineLow'),
    summary: t(lang, 'resultsSummaryLow')
  };
}
export const getAreaDetails = (lang: Language) => ({
  areaA: { title: t(lang, 'areaA') },
  areaB: { title: t(lang, 'areaB') },
  areaC: { title: t(lang, 'areaC') },
});
export const getResultTexts = (lang: Language): Record<MaturityLevel, string> => ({
  low: t(lang, 'resultTextLow'),
  medium: t(lang, 'resultTextMedium'),
  high: t(lang, 'resultTextHigh'),
});