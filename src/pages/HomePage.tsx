import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { StepCard } from '@/components/funnel/StepCard';
import { ProgressStepper } from '@/components/funnel/ProgressStepper';
import { LeadForm } from '@/components/funnel/LeadForm';
import { useFunnelStore, questions, computeAreaScores, computeAverageScore, deriveAreaLabel, deriveOverallLabel, areaDetails, resultTexts, type Question } from '@/lib/funnel';
import { ArrowLeft, BarChart, CheckCircle, Shield, Users, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
type FunnelStep = 'start' | 'level1' | 'level2' | 'level3' | 'results' | 'form' | 'thanks';
export function HomePage() {
  const [step, setStep] = useState<FunnelStep>('start');
  const answers = useFunnelStore(s => s.answers);
  const setAnswer = useFunnelStore(s => s.setAnswer);
  const resetFunnel = useFunnelStore(s => s.reset);
  const scores = useMemo(() => {
    const areaScores = computeAreaScores(answers);
    const average = computeAverageScore(areaScores);
    return { ...areaScores, average };
  }, [answers]);
  const l1aAnswer = answers['L1-A'];
  const l1bAnswer = answers['L1-B'];
  const level2Questions = useMemo(() => [
    (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') && questions['L2-A1'],
    (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') && questions['L2-A2'],
    (l1bAnswer === 'L1-B-1' || l1bAnswer === 'L1-B-2') && questions['L2-B1'],
    (l1bAnswer === 'L1-B-1' || l1bAnswer === 'L1-B-2') && questions['L2-B2'],
    questions['L2-C1'],
  ].filter((q): q is Question => !!q), [l1aAnswer, l1bAnswer]);
  const level3Questions = useMemo(() => [
    (l1aAnswer === 'L1-A-1' || l1aAnswer === 'L1-A-2') ? questions['L3-A1'] : questions['L3-A1-ALT'],
    questions['L3-B1'],
    questions['L3-C1'],
  ].filter((q): q is Question => !!q), [l1aAnswer]);
  const isLevel1Complete = answers['L1-A'] && answers['L1-B'] && answers['L1-C'];
  const isLevel2Complete = level2Questions.every(q => answers[q.id]);
  const isLevel3Complete = level3Questions.every(q => answers[q.id]);
  const renderContent = () => {
    switch (step) {
      case 'start': return <StartScreen onStart={() => setStep('level1')} />;
      case 'level1': return <QuizStep key="level1" stepIndex={0} title="Basis-Check" questions={[questions['L1-A'], questions['L1-B'], questions['L1-C']]} onBack={() => setStep('start')} onNext={() => setStep('level2')} isNextDisabled={!isLevel1Complete} />;
      case 'level2': return <QuizStep key="level2" stepIndex={1} title="Details zu deiner Umgebung" questions={level2Questions} onBack={() => setStep('level1')} onNext={() => setStep('level3')} isNextDisabled={!isLevel2Complete} />;
      case 'level3': return <QuizStep key="level3" stepIndex={2} title="Einschätzung deiner Reifegrade" questions={level3Questions} onBack={() => setStep('level2')} onNext={() => setStep('results')} isNextDisabled={!isLevel3Complete} />;
      case 'results': return <ResultsScreen scores={scores} onNext={() => setStep('form')} />;
      case 'form': return <LeadForm scores={scores} onSuccess={() => setStep('thanks')} />;
      case 'thanks': return <ThanksScreen onReset={() => { resetFunnel(); setStep('start'); }} />;
      default: return <StartScreen onStart={() => setStep('level1')} />;
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-slate-950 dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 dark:opacity-30"></div>
      </div>
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>
      <Toaster richColors closeButton />
    </div>
  );
}
const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <motion.div
    key="start"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
    className="text-center flex flex-col items-center space-y-8"
  >
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground">
        Wie widerstandsfähig ist dein Unternehmen gegen Cyberangriffe?
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground text-balance">
        Kurzer 3-Stufen-Check zu VPN, Web-Anwendungen und Mitarbeiter-Sicherheit – mit konkreten Handlungsempfehlungen.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl w-full pt-8">
        <InfoCard icon={<CheckCircle className="w-8 h-8 text-primary" />} title="Klare Einschätzung" text="Erhalte eine klare Einschätzung deines Security-Reifegrads." />
        <InfoCard icon={<BarChart className="w-8 h-8 text-primary" />} title="Moderne Best Practices" text="Sieh, wo du im Vergleich zu Zero Trust, DDoS-Schutz & Awareness stehst." />
        <InfoCard icon={<Shield className="w-8 h-8 text-primary" />} title="Konkrete Unterstützung" text="Erfahre, wie Cloudflare, Ubiquiti und HXNWRK dich unterstützen können." />
    </div>
    <div className="text-center space-y-4 pt-8">
        <p className="text-muted-foreground">Dauer: ca. 2–3 Minuten</p>
        <Button size="lg" className="btn-gradient px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-primary/80 transition-all duration-300 hover:-translate-y-1" onClick={onStart}>
            Jetzt Security-Check starten
        </Button>
        <p className="text-sm text-muted-foreground pt-4">von Busch GmbH – IT-Solutions & Security <br/> In Kooperation mit Cloudflare und HXNWRK</p>
    </div>
  </motion.div>
);
const InfoCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border shadow-soft text-center flex flex-col items-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{text}</p>
    </div>
);
const listVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  hidden: {
    opacity: 0,
  },
};
const QuizStep = ({ stepIndex, title, questions, onBack, onNext, isNextDisabled }: { stepIndex: number, title: string, questions: Question[], onBack: () => void, onNext: () => void, isNextDisabled: boolean }) => {
  const answers = useFunnelStore(s => s.answers);
  const setAnswer = useFunnelStore(s => s.setAnswer);
  return (
    <motion.div
      key={`step-${stepIndex}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="max-w-3xl mx-auto space-y-8"
    >
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
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Zurück</Button>
        <Button onClick={onNext} disabled={isNextDisabled} className="btn-gradient">Weiter</Button>
      </div>
    </motion.div>
  );
};
const ResultsScreen = ({ scores, onNext }: { scores: any, onNext: () => void }) => {
  const overall = deriveOverallLabel(scores.average);
  const areaALabel = deriveAreaLabel(scores.areaA);
  const areaBLabel = deriveAreaLabel(scores.areaB);
  const areaCLabel = deriveAreaLabel(scores.areaC);
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">{overall.headline}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{overall.summary}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <ResultCard icon={<Wifi />} title={areaDetails.areaA.title} label={areaALabel} text={resultTexts[areaALabel.level]} />
        <ResultCard icon={<Shield />} title={areaDetails.areaB.title} label={areaBLabel} text={resultTexts[areaBLabel.level]} />
        <ResultCard icon={<Users />} title={areaDetails.areaC.title} label={areaCLabel} text={resultTexts[areaCLabel.level]} />
      </div>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Wie wir dich unterstützen können</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Mit der Kombination aus Cloudflare, Ubiquiti, HXNWRK und von Busch bringen wir dein Unternehmen auf ein neues Sicherheits- und Performance-Level:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-foreground">Cloudflare Connectivity Cloud:</strong> Zero Trust, Schutz für Web-Anwendungen (WAF, DDoS), sichere Konnektivität.</li>
            <li><strong className="text-foreground">Ubiquiti-Hardware:</strong> Moderne Netzwerk-Infrastruktur als solide Basis.</li>
            <li><strong className="text-foreground">HXNWRK & von Busch:</strong> Planung, Implementierung und Betrieb moderner Architekturen.</li>
          </ul>
          <p>Auf Wunsch erhältst du eine individuelle Auswertung deines Checks und konkrete Handlungsempfehlungen – zugeschnitten auf deine Umgebung.</p>
        </CardContent>
      </Card>
      <div className="text-center pt-6">
        <Button size="lg" className="btn-gradient px-8 py-5 text-lg" onClick={onNext}>
          Individuelle Auswertung & Beratung anfordern
        </Button>
      </div>
    </motion.div>
  );
};
const ResultCard = ({ icon, title, label, text }: { icon: React.ReactNode, title: string, label: any, text: string }) => (
  <Card className="flex flex-col shadow-soft">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between">
      <div>
        <div className={cn("text-sm font-bold px-2 py-1 rounded-full inline-block", label.bgColor, label.color)}>
          {label.text}
        </div>
        <p className="text-sm text-muted-foreground mt-3">{text}</p>
      </div>
    </CardContent>
  </Card>
);
const ThanksScreen = ({ onReset }: { onReset: () => void }) => (
  <motion.div
    key="thanks"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center max-w-2xl mx-auto space-y-6 py-16"
  >
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
    <h2 className="text-4xl font-bold font-display">Vielen Dank – wir melden uns bei dir!</h2>
    <p className="text-lg text-muted-foreground">
      Deine Angaben sind bei uns eingegangen. Unsere Spezialisten von von Busch / HXNWRK melden sich zeitnah bei dir, um dein Ergebnis im Detail zu besprechen und dir konkrete Optionen mit Cloudflare & Ubiquiti zu zeigen.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
      <Button asChild size="lg" variant="outline">
        <a href="https://www.vonbusch.digital" target="_blank" rel="noopener noreferrer">Website von Busch besuchen</a>
      </Button>
      <Button size="lg" className="btn-gradient" onClick={onReset}>Neuen Check starten</Button>
    </div>
  </motion.div>
);