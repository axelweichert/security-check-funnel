import React from 'react';
export function Footer() {
  return (
    <footer className="border-t border-border/20 mt-12 pt-8 text-center" role="contentinfo">
      <p className="text-muted-foreground text-xs md:text-sm mb-2">
        von Busch GmbH - Alfred-Bozi-Stra��e 12 - 33602 Bielefeld |{' '}
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
      <p className="text-muted-foreground text-xs md:text-sm">
        Ein Service der von Busch GmbH. Built with ❤️ at Cloudflare.
      </p>
    </footer>
  );
}