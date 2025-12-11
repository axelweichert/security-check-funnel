import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  isMultiPart?: boolean;
}
export type AnswersState = Record<QuestionId, AnswerId>;
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
// This is a static object, effectively memoized at the module level. No need for useMemo in components.
export const questions: Record<QuestionId, Question> = {
  // Level 1
  'L1-A': {
    id: 'L1-A',
    text: '1. Setzt du heute bereits eine VPN- oder Remote-Access-Lösung für Mitarbeitende ein?',
    options: [
      { id: 'L1-A-1', text: 'Ja, für einen Großteil unserer Remote-Nutzer', score: 2 },
      { id: 'L1-A-2', text: 'Ja, aber nur für wenige ausgewählte Mitarbeitende', score: 1 },
      { id: 'L1-A-3', text: 'Nein, wir haben aktuell keine VPN/Remote-Access-Lösung im Einsatz', score: 0 },
      { id: 'L1-A-4', text: 'Ich weiß es nicht', score: 0 },
    ],
  },
  'L1-B': {
    id: 'L1-B',
    text: '2. Bildest du geschäftskritische Prozesse über eure Webseite oder Online-Plattformen ab?',
    subtext: '(z. B. Kundenportal, Webshop, Terminbuchung, Service-Portal)',
    options: [
      { id: 'L1-B-1', text: 'Ja, mehrere geschäftskritische Prozesse laufen online', score: 2 },
      { id: 'L1-B-2', text: 'Teilweise – einige Services laufen online, aber vieles noch klassisch/offline', score: 1 },
      { id: 'L1-B-3', text: 'Nein, unsere Webseite ist eher eine Visitenkarte', score: 0 },
      { id: 'L1-B-4', text: 'Ich bin mir nicht sicher', score: 0 },
    ],
  },
  'L1-C': {
    id: 'L1-C',
    text: '3. Wie gut sind deine Mitarbeitende aktuell in Bezug auf Phishing, Social Engineering und IT-Sicherheit geschult?',
    options: [
      { id: 'L1-C-1', text: 'Wir führen regelmäßig verpflichtende Awareness-Trainings & Phishing-Simulationen durch', score: 2 },
      { id: 'L1-C-2', text: 'Es gibt gelegentliche Schulungen, aber nicht strukturiert', score: 1 },
      { id: 'L1-C-3', text: 'Schulungen finden so gut wie nicht statt', score: 0 },
      { id: 'L1-C-4', text: 'Ich weiß es nicht', score: 0 },
    ],
  },
  // Level 2
  'L2-A1': {
    id: 'L2-A1',
    text: '1. Welche Lösung setzt du aktuell für VPN oder Remote Access ein?',
    options: [
      { id: 'L2-A1-1', text: 'Klassisches VPN (z. B. IPsec, OpenVPN, Firewall-VPN)', score: 1 },
      { id: 'L2-A1-2', text: 'Zero Trust / Cloud-basierter Zugang (z. B. Cloudflare Access o. ä.)', score: 2 },
      { id: 'L2-A1-3', text: 'SSL-VPN oder Remote-Desktop-Gateway', score: 1 },
      { id: 'L2-A1-4', text: 'Ich weiß es nicht / Sonstige Lösung', score: 0 },
    ],
  },
  'L2-A2': {
    id: 'L2-A2',
    text: '... und wie viele Nutzer greifen typischerweise darüber zu?',
    options: [
      { id: 'L2-A2-1', text: '1–20 Nutzer', score: 0 },
      { id: 'L2-A2-2', text: '21–100 Nutzer', score: 1 },
      { id: 'L2-A2-3', text: 'Über 100 Nutzer', score: 2 },
    ],
  },
  'L2-B1': {
    id: 'L2-B1',
    text: '2. Wie werden eure geschäftskritischen Online-Dienste bereitgestellt?',
    options: [
      { id: 'L2-B1-1', text: 'Wir hosten selbst in unserem Rechenzentrum / Serverraum', score: 0 },
      { id: 'L2-B1-2', text: 'Wir hosten bei einem Hoster / in der Cloud (z. B. IaaS, Managed Hosting)', score: 1 },
      { id: 'L2-B1-3', text: 'Hybrid (eigene Systeme + Cloud/Hosting)', score: 1 },
      { id: 'L2-B1-4', text: 'Ich weiß es nicht', score: 0 },
    ],
  },
  'L2-B2': {
    id: 'L2-B2',
    text: 'Setzt ihr bereits Schutzmechanismen wie Web Application Firewall (WAF), DDoS-Schutz oder CDN vor euren Online-Diensten ein?',
    options: [
      { id: 'L2-B2-1', text: 'Ja, WAF und DDoS-Schutz sind aktiv', score: 2 },
      { id: 'L2-B2-2', text: 'Teilweise – z. B. nur CDN oder einfache Firewall-Regeln', score: 1 },
      { id: 'L2-B2-3', text: 'Nein, unsere Web-Dienste sind nicht speziell abgesichert', score: 0 },
      { id: 'L2-B2-4', text: 'Ich weiß es nicht', score: 0 },
    ],
  },
  'L2-C1': {
    id: 'L2-C1',
    text: '3. Hattet ihr in den letzten 24 Monaten bereits mindestens einen Cyber Security Vorfall?',
    subtext: '(z. B. Ransomware, erfolgreiche Phishing-Attacke, kompromittierte Konten, Ausfall durch DDoS)',
    options: [
      { id: 'L2-C1-1', text: 'Ja, mehrere', score: 0 },
      { id: 'L2-C1-2', text: 'Ja, ein einzelner Vorfall', score: 1 },
      { id: 'L2-C1-3', text: 'Nein, keine bekannten Vorfälle', score: 2 },
      { id: 'L2-C1-4', text: 'Wir wissen es nicht genau / k��nnte sein', score: 0 },
    ],
  },
  // Level 3
  'L3-A1': {
    id: 'L3-A1',
    text: '1. Wie zufrieden bist du mit eurer aktuellen VPN-/Remote-Lösung hinsichtlich Performance, Sicherheit und Usability?',
    options: [
      { id: 'L3-A1-1', text: 'Sehr zufrieden – läuft stabil, schnell und sicher', score: 2 },
      { id: 'L3-A1-2', text: 'Ganz okay, aber wir stoßen immer wieder an Grenzen', score: 1 },
      { id: 'L3-A1-3', text: 'Unzufrieden – Lösung ist langsam, unsicher oder schwer zu administrieren', score: 0 },
    ],
  },
  'L3-A1-ALT': {
    id: 'L3-A1-ALT',
    text: '1. Wie greifen Remote-Mitarbeitende heute auf interne Systeme zu?',
    options: [
      { id: 'L3-A1-ALT-1', text: 'Remote-Zugriff ist aktuell kaum möglich / nur über Workarounds', score: 0 },
      { id: 'L3-A1-ALT-2', text: 'Es gibt individuelle Lösungen (z. B. direkte RDP, Portfreigaben, TeamViewer etc.)', score: 0 },
      { id: 'L3-A1-ALT-3', text: 'Wir haben bewusst alles in sichere SaaS-Lösungen verlagert', score: 1 },
    ],
  },
  'L3-B1': {
    id: 'L3-B1',
    text: '2. Wie gut glaubst du ist eure Infrastruktur gegen Angriffe und Ausfälle geschützt?',
    subtext: '(z. B. DDoS, Bots, Exploits, Ausfälle von Webshops/Kundenportalen)',
    options: [
      { id: 'L3-B1-1', text: 'Sehr gut – wir haben mehrschichtige Schutzmechanismen (z. B. WAF, DDoS-Mitigation, Bot-Management) im Einsatz', score: 2 },
      { id: 'L3-B1-2', text: 'Solide, aber wir verlassen uns vor allem auf Standard-Firewalls & Provider-Schutz', score: 1 },
      { id: 'L3-B1-3', text: 'Eher schlecht, hier ist definitiv eine Lücke', score: 0 },
      { id: 'L3-B1-4', text: 'Ich weiß es nicht', score: 0 },
    ],
  },
  'L3-C1': {
    id: 'L3-C1',
    text: '3. Ist deinem Unternehmen bereits finanzieller Schaden durch Cyberangriffe, Betrugsversuche oder Security-Vorfälle entstanden?',
    options: [
      { id: 'L3-C1-1', text: 'Ja, im deutlich messbaren Bereich (z. B. Umsatzverlust, Lösegeldzahlungen, Ausfallzeiten)', score: 0 },
      { id: 'L3-C1-2', text: 'Einige kleinere Vorfälle / indirekte Kosten (Mehraufwand, interne Projekte)', score: 1 },
      { id: 'L3-C1-3', text: 'Nein, bislang noch keine bekannten Schäden', score: 2 },
      { id: 'L3-C1-4', text: 'Unklar / nicht bekannt', score: 0 },
    ],
  },
};
// --- SCORING LOGIC ---
function getScoreForAnswer(questionId: QuestionId, answerId: AnswerId | null): number {
  if (!answerId) return 0;
  const question = questions[questionId];
  const answer = question.options.find(opt => opt.id === answerId);
  return answer ? answer.score : 0;
}
export interface AreaScores {
  areaA: number;
  areaB: number;
  areaC: number;
}
export function computeAreaScores(answers: AnswersState): AreaScores {
  const scoreA = getScoreForAnswer('L1-A', answers['L1-A']) +
                 getScoreForAnswer('L2-A1', answers['L2-A1']) +
                 getScoreForAnswer('L2-A2', answers['L2-A2']) +
                 (answers['L1-A'] === 'L1-A-1' || answers['L1-A'] === 'L1-A-2'
                   ? getScoreForAnswer('L3-A1', answers['L3-A1'])
                   : getScoreForAnswer('L3-A1-ALT', answers['L3-A1-ALT']));
  const scoreB = getScoreForAnswer('L1-B', answers['L1-B']) +
                 getScoreForAnswer('L2-B1', answers['L2-B1']) +
                 getScoreForAnswer('L2-B2', answers['L2-B2']) +
                 getScoreForAnswer('L3-B1', answers['L3-B1']);
  const scoreC = getScoreForAnswer('L1-C', answers['L1-C']) +
                 getScoreForAnswer('L2-C1', answers['L2-C1']) +
                 getScoreForAnswer('L3-C1', answers['L3-C1']);
  return {
    areaA: Math.min(6, scoreA),
    areaB: Math.min(6, scoreB),
    areaC: Math.min(6, scoreC),
  };
}
export function computeAverageScore(areaScores: AreaScores): number {
  const totalScore = areaScores.areaA + areaScores.areaB + areaScores.areaC;
  // Average score across the three areas to normalize it for overall rating.
  return totalScore / 3;
}
export type MaturityLevel = 'high' | 'medium' | 'low';
export type ResultLabel = {
  level: MaturityLevel;
  text: string;
  color: string;
  bgColor: string;
};
export function deriveAreaLabel(score: number): ResultLabel {
  if (score >= 5) { // 5-6 points
    return { level: 'high', text: 'Geringes Risiko / Hohe Reife', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/50' };
  }
  if (score >= 3) { // 3-4 points
    return { level: 'medium', text: 'Mittleres Risiko / Mittlere Reife', color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' };
  }
  // 0-2 points
  return { level: 'low', text: 'Hohes Risiko / Niedrige Reife', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/50' };
}
export function deriveOverallLabel(averageScore: number): { headline: string; summary: string } {
  if (averageScore >= 4.5) {
    return {
      headline: 'Dein Security-Check: Solide aufgestellt – jetzt optimieren',
      summary: 'Dein Unternehmen ist in vielen Bereichen bereits gut aufgestellt. Nutze die Chance, um durch gezielte Optimierungen mit modernen Cloud-Technologien deinen Vorsprung weiter auszubauen und deine Resilienz zu maximieren.'
    };
  }
  if (averageScore >= 2.5) {
    return {
      headline: 'Dein Security-Check: Mittleres Risiko – gute Basis, Luft nach oben',
      summary: 'Dein Unternehmen ist in einigen Bereichen bereits gut aufgestellt, in anderen gibt es deutlichen Nachholbedarf – insbesondere dort, wo Remote-Zugänge, geschäftskritische Web-Anwendungen oder Security Awareness noch nicht optimal abgesichert sind.'
    };
  }
  return {
    headline: 'Dein Security-Check: Hoher Handlungsbedarf',
    summary: 'Unsere Analyse zeigt kritische Lücken in mehreren Bereichen deiner IT-Sicherheit. Es besteht akuter Handlungsbedarf, um dein Unternehmen wirksam gegen Cyberangriffe, Ausfälle und Datenverlust zu schützen.'
  };
}
export const areaDetails = {
  areaA: { title: 'VPN / Remote Access', description: 'Sicherheit und Performance für deine Remote-Mitarbeitenden.' },
  areaB: { title: 'Web & Online-Prozesse', description: 'Schutz deiner Webseiten und geschäftskritischen Anwendungen.' },
  areaC: { title: 'Mitarbeiter-Sicherheit (Awareness)', description: 'Die menschliche Firewall deines Unternehmens stärken.' },
};
// Concise texts for better screen reader experience.
export const resultTexts: Record<MaturityLevel, string> = {
  low: 'In diesem Bereich besteht ein erhöhtes Risiko. Angriffe oder Ausfälle könnten schnell geschäftskritische Auswirkungen haben.',
  medium: 'Du hast eine Basis geschaffen, profitierst aber deutlich von modernen Zero-Trust- und Cloud-Security-Ansätzen.',
  high: 'Hier bist du bereits weit fortgeschritten – wir können dir helfen, diesen Vorsprung effizient zu sichern und weiter auszubauen.',
};