import React from 'react';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
interface ThanksScreenProps {
  onReset: () => void;
}
const ThanksScreenComponent = ({ onReset }: ThanksScreenProps) => {
  const lang = useCurrentLang();
  return (
    <div
      key="thanks"
      className="text-center max-w-2xl mx-auto space-y-6 py-16 animate-in fade-in scale-in-95 duration-500"
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
    </div>
  );
};
export const ThanksScreen = React.memo(ThanksScreenComponent);