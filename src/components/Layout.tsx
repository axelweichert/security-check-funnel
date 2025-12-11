import React, { useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}
const defaultTitle = 'Security-Check Funnel | von Busch GmbH';
const defaultDescription = 'Stilvoller 3‑Schritt Security-Check (DE) mit Scoring, Ergebnis-Auswertung und Lead-Formular zur Beratungseinleitung.';
const ogImageUrl = 'https://www.vonbusch.digital/images/og-image.png'; // Placeholder OG image URL
export function Layout({ children, title = defaultTitle, description = defaultDescription }: LayoutProps) {
  // Ensure theme is applied globally on layout mount
  useTheme();
  useEffect(() => {
    // Set document language for accessibility
    document.documentElement.lang = 'de';
    // Update title
    document.title = title;
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    // --- Open Graph / Social Media Meta Tags ---
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
  }, [title, description]);
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-slate-950 dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 dark:opacity-30"></div>
      </div>
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <main>
        {children}
      </main>
      <Toaster richColors closeButton />
    </div>
  );
}