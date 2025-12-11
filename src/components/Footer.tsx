import React from 'react';
import { Heart } from 'lucide-react';
export function Footer() {
  return (
    <footer className="border-t border-border/20 mt-12 pt-8 text-center" role="contentinfo">
      <p className="text-muted-foreground dark:text-muted-foreground/90 text-xs md:text-sm mb-2">
        {/* UTF-8: Use 'ß' directly; test in non-UTF envs for 'ss' degradation */}
        von Busch GmbH - Alfred-Bozi-{'Stra\u00dfe'} 12 - 33602 Bielefeld |{' '}
        <a
          href="https://www.vonbusch.digital/impressum"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          aria-label="Impressum öffnen"
        >
          Impressum
        </a>{' '}
        |{' '}
        <a
          href="https://www.vonbusch.digital/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          aria-label="Datenschutz öffnen"
        >
          Datenschutz
        </a>
      </p>
      <p className="text-muted-foreground dark:text-muted-foreground/90 text-xs md:text-sm">
        Ein Service der von Busch GmbH. Built with <Heart className="inline h-3 w-3 text-red-500 fill-current" /> at Cloudflare.
      </p>
    </footer>
  );
}