import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LeadForm } from '@/components/funnel/LeadForm';
import {
  useFunnelStore,
  getQuestions,
  computeAreaScores,
  computeAverageScore,
  type Question,
} from '@/lib/funnel';
import { useCurrentLang } from '@/stores/useLangStore';
import { StartScreen } from '@/components/funnel/StartScreen';
import { QuizStep } from '@/components/funnel/QuizStep';
import { ResultsScreen } from '@/components/funnel/ResultsScreen';
import { ThanksScreen } from '@/components/funnel/ThanksScreen';
/**
 * Defines the possible steps in the security check funnel.
 */
type FunnelStep =
  | 'start'
  | 'level1'
  | 'level2'
  | 'level3'
  | 'results'
  | 'form'
  | 'thanks';
/**
 * The main component for the von Busch Security Funnel.
 * It orchestrates the entire 7-step user journey from the start screen to the final thank you message.
 * State is managed by a combination of React's `useState` for the current step and Zustand for quiz answers.
 * The backend for lead submission is powered by Cloudflare Pages Functions and KV storage via `/functions/api/leads`.
 */
export function HomePage() {
  const lang = useCurrentLang();
  const [step, setStep] = useState<FunnelStep>('start');
  // Zustand selectors for answers. Using primitive selectors to prevent unnecessary re-renders.
  const answers = useFunnelStore((s) => s.answers);
  const resetFunnel = useFunnelStore((s) => s.reset);
  const l1aAnswer = useFunnelStore((s) => s.answers['L1-A']);
  const l1bAnswer = useFunnelStore((s) => s.answers['L1-B']);
  /**
   * Memoized questions object to avoid re-computation on every render.
   * It recalculates only when the language changes.
   */
  const questions = useMemo(() => getQuestions(lang), [lang]);
  /**
   * Memoized scores object.
   * This recalculates the area scores and the average score only when answers or language change,
   * optimizing performance by avoiding redundant calculations.
   */
  const scores = useMemo(() => {
    const areaScores = computeAreaScores(answers, lang);
    const average = computeAverageScore(areaScores);
    return { ...areaScores, average };
  }, [answers, lang]);
  /**
   * Memoized list of questions for Level 2.
   * The questions are dynamically determined based on the answers from Level 1,
   * ensuring a conditional and relevant user flow.
   */
  const level2Questions = useMemo(
    () => [
      (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') && questions['L2-A1'],
      (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') && questions['L2-A2'],
      (l1bAnswer === 'L1-B-1' || l1bAnswer === 'L1-B-2') && questions['L2-B1'],
      (l1bAnswer === 'L1-B-1' || l1bAnswer === 'L1-B-2') && questions['L2-B2'],
      questions['L2-C1'],
    ].filter((q): q is Question => !!q),
    [l1aAnswer, l1bAnswer, questions],
  );
  /**
   * Memoized list of questions for Level 3.
   * Similar to Level 2, questions are shown conditionally based on previous answers.
   */
  const level3Questions = useMemo(
    () => [
      l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2'
        ? questions['L3-A1']
        : questions['L3-A1-ALT'],
      questions['L3-B1'],
      questions['L3-C1'],
    ].filter((q): q is Question => !!q),
    [l1aAnswer, questions],
  );
  // Completion checks to enable/disable the "Next" button in each step.
  const isLevel1Complete = answers['L1-A'] && answers['L1-B'] && answers['L1-C'];
  const isLevel2Complete = level2Questions.every((q) => answers[q.id]);
  const isLevel3Complete = level3Questions.every((q) => answers[q.id]);
  /**
   * Renders the component corresponding to the current funnel step.
   * A switch statement provides a clean way to manage the view transitions.
   */
  const renderContent = () => {
    switch (step) {
      case 'start':
        return <StartScreen onStart={() => setStep('level1')} />;
      case 'level1':
        return (
          <QuizStep
            key="level1"
            stepIndex={0}
            questions={[
              questions['L1-A'],
              questions['L1-B'],
              questions['L1-C'],
            ]}
            onBack={() => setStep('start')}
            onNext={() => setStep('level2')}
            isNextDisabled={!isLevel1Complete}
          />
        );
      case 'level2':
        return (
          <QuizStep
            key="level2"
            stepIndex={1}
            questions={level2Questions}
            onBack={() => setStep('level1')}
            onNext={() => setStep('level3')}
            isNextDisabled={!isLevel2Complete}
          />
        );
      case 'level3':
        return (
          <QuizStep
            key="level3"
            stepIndex={2}
            questions={level3Questions}
            onBack={() => setStep('level2')}
            onNext={() => setStep('results')}
            isNextDisabled={!isLevel3Complete}
          />
        );
      case 'results':
        return (
          <ResultsScreen
            key="results"
            scores={scores}
            answers={answers}
            onNext={() => setStep('form')}
          />
        );
      case 'form':
        return (
          <LeadForm
            scores={scores}
            answers={answers}
            onSuccess={() => setStep('thanks')}
          />
        );
      case 'thanks':
        return (
          <ThanksScreen
            key="thanks"
            onReset={() => {
              resetFunnel();
              setStep('start');
            }}
          />
        );
      default:
        return <StartScreen onStart={() => setStep('level1')} />;
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        {/* AnimatePresence handles the smooth transitions between funnel steps. */}
        <AnimatePresence mode="wait">
          <div key={step} className="w-full">
            {renderContent()}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}