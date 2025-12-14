import React, { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LangToggle } from '@/components/LangToggle';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentLang } from '@/stores/useLangStore';
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}
declare global {
  interface Window {
    plausible?: (event: string, options?: { props: Record<string, any> }) => void;
  }
}
const defaultTitle = 'Security-Check in 3 Minuten by vonBusch';
const defaultDescription = 'Stilvoller 3‑Schritt Security-Check (DE) mit Scoring, Ergebnis-Auswertung und Lead-Formular zur Beratungseinleitung.';
const ogImageUrl = 'https://www.vonbusch.digital/images/og-image.png'; // Placeholder OG image URL
export function Layout({ children, title = defaultTitle, description = defaultDescription }: LayoutProps) {
  useTheme();
  const lang = useCurrentLang() ?? 'de';
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  useEffect(() => {
    // PWA Service Worker Registration (disabled in dev mode)
    if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
    const checkConsent = () => {
      setAnalyticsConsent(localStorage.getItem('analyticsConsent') === 'true');
    };
    checkConsent();
    // Listen for changes from the lead form
    window.addEventListener('analyticsConsentChanged', checkConsent);
    const handleLeadSubmit = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (window.plausible) {
        window.plausible('lead_submit', { props: customEvent.detail });
      }
    };
    window.addEventListener('leadSubmit', handleLeadSubmit);
    return () => {
      window.removeEventListener('analyticsConsentChanged', checkConsent);
      window.removeEventListener('leadSubmit', handleLeadSubmit);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    const finalTitle = title + ' | von Busch Security';
    if (document.title !== finalTitle) {
      document.title = finalTitle;
    }
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    const metaTags = {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:image': ogImageUrl,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImageUrl,
    };
    Object.entries(metaTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', 'https://vonbusch.digital/favicon.ico');
    favicon.setAttribute('type', 'image/x-icon');
  }, [title, description, lang]);
  useEffect(() => {
    const scriptId = 'plausible-analytics';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (analyticsConsent) {
      if (!script) {
        const newScript = document.createElement('script') as HTMLScriptElement;
        newScript.id = scriptId;
        newScript.defer = true;
        newScript.setAttribute('data-domain', 'check.vonbusch.digital');
        newScript.src = 'https://plausible.io/js/script.js';
        newScript.setAttribute('crossorigin', 'anonymous'); // Fix for module script import failure
        newScript.onerror = () => {
          console.warn('Plausible script failed to load.');
          newScript.remove();
        };
        document.head.appendChild(newScript);
      }
    } else {
      if (script) {
        script.onerror = null; // Clean up error handler before removing
        script.remove();
      }
    }
    if (!window.plausible && analyticsConsent) {
        console.warn('Plausible not ready');
    }
  }, [analyticsConsent]);
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-slate-950 dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 dark:opacity-30"></div>
      </div>
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <LangToggle className="fixed top-4 right-16 z-50" />
      <main>
        {children}
      </main>
      <Toaster richColors closeButton />
    </div>
  );
}