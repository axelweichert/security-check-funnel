import React, { useState, useEffect, useCallback, useRef } from 'react';
declare global {
  interface Window {
    plausible?: (event: string, options?: { props: Record<string, any> }) => void;
  }
}
/**
 * PlausibleLoader
 *
 * Handles GDPR‑compliant loading of the Plausible analytics script.
 * - Listens for consent changes (`analyticsConsentChanged`) and loads/removes the script accordingly.
 * - Sends a `lead_submit` event when the lead form dispatches a `leadSubmit` custom event.
 * - No UI is rendered; the component solely manages side‑effects.
 */
export default function PlausibleLoader() {
  // Consent state – initialised from localStorage
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(false);
  // Reference to the injected script element for clean removal
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  /**
   * Loads the Plausible script if it hasn't been added yet.
   * Guarantees a single script instance and sets up onload / onerror handlers.
   */
  const loadPlausible = useCallback(() => {
    const scriptId = 'plausible-analytics';
    if (document.getElementById(scriptId) || scriptRef.current) {
      return;
    }
    const newScript = document.createElement('script');
    newScript.id = scriptId;
    newScript.type = 'module';
    newScript.async = true;
    newScript.defer = true;
    newScript.setAttribute('data-domain', 'check.vonbusch.digital');
    newScript.src = 'https://plausible.io/js/script.js';
    newScript.crossOrigin = 'anonymous';
    newScript.onload = () => {
      console.log('Plausible script loaded successfully.');
      window.plausible?.('pageview');
    };
    newScript.onerror = () => {
      // Fail silently and clean up the script element
      scriptRef.current?.remove();
      scriptRef.current = null;
    };
    scriptRef.current = newScript;
    document.head.appendChild(newScript);
  }, []);
  /**
   * Effect: initialise consent state and register global event listeners.
   * - `analyticsConsentChanged` updates the local consent flag.
   * - `leadSubmit` forwards lead‑submission data to Plausible.
   */
  useEffect(() => {
    const checkConsent = () => {
      setAnalyticsConsent(localStorage.getItem('analyticsConsent') === 'true');
    };
    // Run once on mount to set the initial state
    checkConsent();
    const handleLeadSubmit = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (window.plausible) {
        window.plausible('lead_submit', { props: customEvent.detail });
      }
    };
    window.addEventListener('analyticsConsentChanged', checkConsent);
    window.addEventListener('leadSubmit', handleLeadSubmit);
    return () => {
      window.removeEventListener('analyticsConsentChanged', checkConsent);
      window.removeEventListener('leadSubmit', handleLeadSubmit);
    };
  }, []);
  /**
   * Effect: load or unload the Plausible script based on consent.
   */
  useEffect(() => {
    if (analyticsConsent) {
      if (!scriptRef.current) {
        loadPlausible();
      }
    } else {
      if (scriptRef.current) {
        // Remove the script cleanly; suppress error handling during removal
        scriptRef.current.onerror = null;
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    }
  }, [analyticsConsent, loadPlausible]);
  // This component does not render any visible UI.
  return null;
}