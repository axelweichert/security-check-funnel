import { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StepCard } from '@/components/funnel/StepCard';
import { ProgressStepper } from '@/components/funnel/ProgressStepper';
import { LeadForm } from '@/components/funnel/LeadForm';
import { useFunnelStore, getQuestions, computeAreaScores, computeAverageScore, deriveAreaLabel, deriveOverallLabel, getAreaDetails, getResultTexts, type Question } from '@/lib/funnel';
import { useShallow } from 'zustand/react/shallow';
import { ArrowLeft, BarChart, CheckCircle, Download, Shield, Users, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
import { useABVariant } from '@/stores/useABStore';
import { downloadReport } from '@/lib/reportGenerator';
type FunnelStep = 'start' | 'level1' | 'level2' | 'level3' | 'results' | 'form' | 'thanks';
export function HomePage() {
  const lang = useCurrentLang();
  const [step, setStep] = useState<FunnelStep>('start');
  const answers = useFunnelStore(useShallow(s => s.answers));
  const setAnswer = useFunnelStore(s => s.setAnswer);
  const resetFunnel = useFunnelStore(s => s.reset);
  const l1aAnswer = useFunnelStore(s => s.answers['L1-A']);
  const l1bAnswer = useFunnelStore(s => s.answers['L1-B']);
  const abVariant = useABVariant();
  const questions = useMemo(() => {
    const q = getQuestions(lang);
    if (abVariant === 'B') {
      q['L1-A'].text = t(lang, 'L1-A-text-B');
    }
    return q;
  }, [lang, abVariant]);
  const scores = useMemo(() => {
    const areaScores = computeAreaScores(answers, lang);
    const average = computeAverageScore(areaScores);
    return { ...areaScores, average };
  }, [answers, lang]);
  const level2Questions = useMemo(() => [
    (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') && questions['L2-A1'],
    (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') && questions['L2-A2'],
    (l1bAnswer === 'L1-B-1' || l1bAnswer === 'L1-B-2') && questions['L2-B1'],
    (l1bAnswer === 'L1-B-1' || l1bAnswer === 'L1-B-2') && questions['L2-B2'],
    questions['L2-C1'],
  ].filter((q): q is Question => !!q), [l1aAnswer, l1bAnswer, questions]);
  const level3Questions = useMemo(() => [
    (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') ? questions['L3-A1'] : questions['L3-A1-ALT'],
    questions['L3-B1'],
    questions['L3-C1'],
  ].filter((q): q is Question => !!q), [l1aAnswer, questions]);
  const isLevel1Complete = answers['L1-A'] && answers['L1-B'] && answers['L1-C'];
  const isLevel2Complete = level2Questions.every(q => answers[q.id]);
  const isLevel3Complete = level3Questions.every(q => answers[q.id]);
  const renderContent = () => {
    switch (step) {
      case 'start': return <StartScreen onStart={() => setStep('level1')} />;
      case 'level1': return <QuizStep key="level1" stepIndex={0} questions={[questions['L1-A'], questions['L1-B'], questions['L1-C']]} onBack={() => setStep('start')} onNext={() => setStep('level2')} isNextDisabled={!isLevel1Complete} />;
      case 'level2': return <QuizStep key="level2" stepIndex={1} questions={level2Questions} onBack={() => setStep('level1')} onNext={() => setStep('level3')} isNextDisabled={!isLevel2Complete} />;
      case 'level3': return <QuizStep key="level3" stepIndex={2} questions={level3Questions} onBack={() => setStep('level2')} onNext={() => setStep('results')} isNextDisabled={!isLevel3Complete} />;
      case 'results': return <ResultsScreen scores={scores} onNext={() => setStep('form')} />;
      case 'form': return <LeadForm scores={scores} onSuccess={() => setStep('thanks')} />;
      case 'thanks': return <ThanksScreen onReset={() => { resetFunnel(); setStep('start'); }} />;
      default: return <StartScreen onStart={() => setStep('level1')} />;
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}
const StartScreen = ({ onStart }: { onStart: () => void }) => {
  const lang = useCurrentLang();
  const abVariant = useABVariant();
  return (
    <motion.div
      key="start"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="text-center flex flex-col items-center space-y-8"
      role="main"
      aria-labelledby="main-heading"
    >
      <div className="space-y-4 max-w-4xl">
        <h1 id="main-heading" className="text-5xl md:text-6xl font-bold font-display text-foreground leading-tight">
          {abVariant === 'B' ? t(lang, 'startHeadlineB') : t(lang, 'startHeadline')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-balance">
          {t(lang, 'startSubline')}
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center space-y-4 w-full pt-4"
      >
        <p className="text-2xl md:text-3xl text-primary font-semibold text-center max-w-2xl mx-auto leading-relaxed">
          <strong>{t(lang, 'startHook')}</strong>
        </p>
        <Button variant="outline" size="lg" asChild>
          <a href="https://radar.cloudflare.com/de-de/reports/ddos-2025-q3" target="_blank" rel="noopener noreferrer" aria-label="Cloudflare DDoS Threat Report Q3-2025 entdecken (öffnet in neuem Tab)">
            <Shield className="mr-2 h-4 w-4" />
            {t(lang, 'startHookCta')}
          </a>
        </Button>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl w-full pt-8">
          <InfoCard icon={<CheckCircle className="w-8 h-8 text-primary" />} title={t(lang, 'startBenefit1Title')} text={abVariant === 'B' ? t(lang, 'startBenefit1B') : t(lang, 'startBenefit1')} />
          <InfoCard icon={<BarChart className="w-8 h-8 text-primary" />} title={t(lang, 'startBenefit2Title')} text={t(lang, 'startBenefit2')} />
          <InfoCard icon={<Shield className="w-8 h-8 text-primary" />} title={t(lang, 'startBenefit3Title')} text={t(lang, 'startBenefit3')} />
      </div>
      <div className="text-center space-y-4 pt-8">
          <p className="text-muted-foreground">{t(lang, 'startDuration')}</p>
          <Button size="lg" className="btn-gradient px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-primary/80 transition-all duration-300 hover:-translate-y-1" onClick={onStart} aria-label="Security-Check starten">
              {t(lang, 'startCta')}
          </Button>
      </div>
      <Footer />
    </motion.div>
  );
};
const InfoCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="glass p-6 rounded-xl text-center flex flex-col items-center">
        <motion.div whileHover={{ scale: 1.1 }} className="mb-4">{icon}</motion.div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{text}</p>
    </div>
);
const listVariants = {
  visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.1 } },
  hidden: { opacity: 0 },
};
const QuizStep = ({ stepIndex, questions, onBack, onNext, isNextDisabled }: { stepIndex: number, questions: Question[], onBack: () => void, onNext: () => void, isNextDisabled: boolean }) => {
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
const ResultsScreen = ({ scores, onNext }: { scores: any, onNext: () => void }) => {
  const lang = useCurrentLang();
  const overall = deriveOverallLabel(scores.average, lang);
  const areaALabel = deriveAreaLabel(scores.areaA, lang);
  const areaBLabel = deriveAreaLabel(scores.areaB, lang);
  const areaCLabel = deriveAreaLabel(scores.areaC, lang);
  const areaDetails = getAreaDetails(lang);
  const resultTexts = getResultTexts(lang);
  const handleDownload = async () => {
    await downloadReport({ scores, lang });
  };
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="text-center space-y-3" aria-live="polite">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">{overall.headline}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">{overall.summary}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <ResultCard icon={<Wifi />} title={areaDetails.areaA.title} label={areaALabel} text={resultTexts[areaALabel.level]} />
        <ResultCard icon={<Shield />} title={areaDetails.areaB.title} label={areaBLabel} text={resultTexts[areaBLabel.level]} />
        <ResultCard icon={<Users />} title={areaDetails.areaC.title} label={areaCLabel} text={resultTexts[areaCLabel.level]} />
      </div>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>{t(lang, 'supportTitle')}</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t(lang, 'supportIntro')}</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-foreground">{t(lang, 'supportLi1')}</strong></li>
            <li><strong className="text-foreground">{t(lang, 'supportLi2')}</strong></li>
            <li><strong className="text-foreground">{t(lang, 'supportLi3')}</strong></li>
          </ul>
          <p>{t(lang, 'supportOutro')}</p>
        </CardContent>
      </Card>
      <div className="text-center pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="btn-gradient px-8 py-5 text-lg" onClick={onNext}>
            {t(lang, 'supportCta')}
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" variant="outline" onClick={handleDownload} aria-label={t(lang, 'downloadReport')}>
              <Download className="mr-2 h-5 w-5" /> {t(lang, 'downloadReport')}
            </Button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
};
const ResultCard = ({ icon, title, label, text }: { icon: React.ReactNode, title: string, label: any, text: string }) => (
  <Card className="flex flex-col glass">
    <CardHeader className="flex flex-row flex-nowrap items-center justify-between space-y-0 pb-4 px-6">
      <CardTitle className="text-sm md:text-base font-medium whitespace-nowrap truncate">{title}</CardTitle>
      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex-shrink-0 ml-4">
        {icon}
      </motion.div>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between px-6 pb-6">
      <div>
        <div className={cn("text-sm font-bold px-2 py-1 rounded-full inline-block", label.bgColor, label.color)}>
          {label.text}
        </div>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{text}</p>
      </div>
    </CardContent>
  </Card>
);
const ThanksScreen = ({ onReset }: { onReset: () => void }) => {
  const lang = useCurrentLang();
  return (
    <motion.div
      key="thanks"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-2xl mx-auto space-y-6 py-16"
    >
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto shadow-soft rounded-full" />
      <h2 className="text-4xl font-bold font-display">{t(lang, 'thanksHeadline')}</h2>
      <p className="text-lg text-muted-foreground">{t(lang, 'thanksText')}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Button asChild size="lg" variant="outline">
          <a href="https://www.vonbusch.digital" target="_blank" rel="noopener noreferrer">{t(lang, 'visitWebsite')}</a>
        </Button>
        <Button size="lg" className="btn-gradient hover:shadow-primary" onClick={onReset}>{t(lang, 'startOver')}</Button>
      </div>
      <div className="pt-4">
        <Button asChild size="lg" variant="outline" className="transition-transform duration-200 hover:scale-105">
          <a href="https://outlook.office.com/book/vonBuschGmbHCloudflare@vonbusch.digital/?ismsaljsauthenabled=true" target="_blank" rel="noopener noreferrer">
            {t(lang, 'bookAppointment')}
          </a>
        </Button>
      </div>
      <Footer />
    </motion.div>
  );
};