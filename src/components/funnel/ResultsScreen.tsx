import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Wifi } from 'lucide-react';
import {
  deriveAreaLabel,
  deriveOverallLabel,
  getAreaDetails,
  getResultTexts,
  type AreaScores,
  getQuestions,
} from '@/lib/funnel';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

interface ResultsScreenProps {
  scores: AreaScores & { average: number };
  answers: Record<string, string>;
  onNext: () => void;
}

const ResultCard = ({
  icon,
  title,
  label,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  label: any;
  text: string;
}) => (
  <Card className="flex flex-col glass">
    <CardHeader className="flex flex-row flex-nowrap items-center justify-between space-y-0 pb-4 px-6">
      <CardTitle className="text-sm md:text-base font-medium whitespace-nowrap truncate">
        {title}
      </CardTitle>
      <div className="flex-shrink-0 ml-4 animate-in fade-in duration-500 delay-200">
        {icon}
      </div>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between px-6 pb-6">
      <div>
        <div
          className={cn(
            'text-sm font-bold px-2 py-1 rounded-full inline-block',
            label.bgColor,
            label.color,
          )}
        >
          {label.text}
        </div>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{text}</p>
      </div>
    </CardContent>
  </Card>
);

const ResultsScreenComponent = ({
  scores,
  answers,
  onNext,
}: ResultsScreenProps) => {
  const lang = useCurrentLang();
  const overall = deriveOverallLabel(scores.average, lang);
  const areaALabel = deriveAreaLabel(scores.areaA, lang);
  const areaBLabel = deriveAreaLabel(scores.areaB, lang);
  const areaCLabel = deriveAreaLabel(scores.areaC, lang);
  const areaDetails = getAreaDetails(lang);
  const resultTexts = getResultTexts(lang);
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const totalQuestions = Object.keys(getQuestions(lang)).length;

  return (
    <div
      key="results"
      className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-500"
    >
      <div className="text-center space-y-3" aria-live="polite">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
          {overall.headline}
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {overall.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-in fade-in">
        <div className="animate-in fade-in-30 slide-in-from-bottom-4 duration-500 delay-200">
          <ResultCard
            icon={<Wifi />}
            title={areaDetails.areaA.title}
            label={areaALabel}
            text={resultTexts[areaALabel.level]}
          />
        </div>
        <div className="animate-in fade-in-30 slide-in-from-bottom-4 duration-500 delay-200">
          <ResultCard
            icon={<Shield />}
            title={areaDetails.areaB.title}
            label={areaBLabel}
            text={resultTexts[areaBLabel.level]}
          />
        </div>
        <div className="animate-in fade-in-30 slide-in-from-bottom-4 duration-500 delay-200">
          <ResultCard
            icon={<Users />}
            title={areaDetails.areaC.title}
            label={areaCLabel}
            text={resultTexts[areaCLabel.level]}
          />
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>{t(lang, 'supportTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>{t(lang, 'supportIntro')}</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-foreground">{t(lang, 'supportLi1')}</strong>
            </li>
            <li>
              <strong className="text-foreground">{t(lang, 'supportLi2')}</strong>
            </li>
            <li>
              <strong className="text-foreground">{t(lang, 'supportLi3')}</strong>
            </li>
          </ul>
          <p>{t(lang, 'supportOutro')}</p>
        </CardContent>
      </Card>

      <div className="text-center pt-6 space-y-3">
        <Button size="lg" className="btn-gradient px-8 py-5 text-lg" onClick={onNext}>
          {t(lang, 'supportCta')}
        </Button>
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            {answeredCount}/{totalQuestions} Fragen beantwortet
          </Badge>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export const ResultsScreen = React.memo(ResultsScreenComponent);
//