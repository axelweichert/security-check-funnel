import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StepCard } from '@/components/funnel/StepCard';
import { ProgressStepper } from '@/components/funnel/ProgressStepper';
import { useFunnelStore, type Question } from '@/lib/funnel';
import { ArrowLeft } from 'lucide-react';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
import { useShallow } from 'zustand/react/shallow';
interface QuizStepProps {
  stepIndex: number;
  questions: Question[];
  onBack: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
}
const listVariants = {
  visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.1 } },
  hidden: { opacity: 0 },
};
const QuizStepComponent = ({ stepIndex, questions, onBack, onNext, isNextDisabled }: QuizStepProps) => {
  const lang = useCurrentLang();
  const answers = useFunnelStore(useShallow(s => s.answers));
  const setAnswer = useFunnelStore(s => s.setAnswer);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepTitles = [t(lang, 'step1Title'), t(lang, 'step2Title'), t(lang, 'step3Title')];
  const title = stepTitles[stepIndex];
  useEffect(() => {
    containerRef.current?.focus();
  }, []);
  return (
    <motion.div
      key={`step-${stepIndex}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="max-w-3xl mx-auto space-y-8"
      role="region"
      aria-labelledby={`step-title-${stepIndex}`}
      ref={containerRef}
      tabIndex={-1}
      style={{outline: 'none'}}
    >
      <h2 id={`step-title-${stepIndex}`} className="sr-only">{`Schritt ${stepIndex + 1}: ${title}`}</h2>
      <ProgressStepper currentStep={stepIndex} totalSteps={3} stepTitle={title} />
      <motion.div
        className="space-y-6 md:space-y-8"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {questions.map(q => (
          <StepCard key={q.id} question={q} value={answers[q.id]} onValueChange={(val) => setAnswer(q.id, val)} />
        ))}
      </motion.div>
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> {t(lang, 'back')}</Button>
        <Button onClick={onNext} disabled={isNextDisabled} className="btn-gradient">{t(lang, 'next')}</Button>
      </div>
    </motion.div>
  );
};
export const QuizStep = React.memo(QuizStepComponent);