import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart, CheckCircle, Shield } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
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
const StartScreenComponent = ({ onStart }: { onStart: () => void }) => {
  const lang = useCurrentLang();
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
          {t(lang, 'startHeadline')}
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
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl w-full pt-8"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
          <InfoCard icon={<CheckCircle className="w-8 h-8 text-primary" />} title={t(lang, 'startBenefit1Title')} text={t(lang, 'startBenefit1')} />
          <InfoCard icon={<BarChart className="w-8 h-8 text-primary" />} title={t(lang, 'startBenefit2Title')} text={t(lang, 'startBenefit2')} />
          <InfoCard icon={<Shield className="w-8 h-8 text-primary" />} title={t(lang, 'startBenefit3Title')} text={t(lang, 'startBenefit3')} />
      </motion.div>
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
export const StartScreen = React.memo(StartScreenComponent);