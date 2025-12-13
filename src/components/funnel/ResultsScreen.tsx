import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Wifi } from 'lucide-react';
import { deriveAreaLabel, deriveOverallLabel, getAreaDetails, getResultTexts, type AreaScores } from '@/lib/funnel';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
interface ResultsScreenProps {
  scores: AreaScores & { average: number };
  onNext: () => void;
}
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
const ResultsScreenComponent = ({ scores, onNext }: ResultsScreenProps) => {
  const lang = useCurrentLang();
  const overall = deriveOverallLabel(scores.average, lang);
  const areaALabel = deriveAreaLabel(scores.areaA, lang);
  const areaBLabel = deriveAreaLabel(scores.areaB, lang);
  const areaCLabel = deriveAreaLabel(scores.areaC, lang);
  const areaDetails = getAreaDetails(lang);
  const resultTexts = getResultTexts(lang);
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
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
          hidden: {},
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <ResultCard icon={<Wifi />} title={areaDetails.areaA.title} label={areaALabel} text={resultTexts[areaALabel.level]} />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <ResultCard icon={<Shield />} title={areaDetails.areaB.title} label={areaBLabel} text={resultTexts[areaBLabel.level]} />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <ResultCard icon={<Users />} title={areaDetails.areaC.title} label={areaCLabel} text={resultTexts[areaCLabel.level]} />
        </motion.div>
      </motion.div>
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
        <Button size="lg" className="btn-gradient px-8 py-5 text-lg" onClick={onNext}>
          {t(lang, 'supportCta')}
        </Button>
      </div>
      <Footer />
    </motion.div>
  );
};
export const ResultsScreen = React.memo(ResultsScreenComponent);