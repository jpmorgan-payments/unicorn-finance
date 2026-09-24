import { useEffect, useState } from "react";

// The Konami code. Case-insensitive on the letter keys since KeyboardEvent.key
// reports "b"/"a" (lowercase) without Shift.
export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)
  );
};

// Enter the Konami code anywhere in the app to open the hidden Payments
// Garage walkthrough (public/garage) - a full navigation, since it's a
// standalone static page, not a route in this SPA. `progress` (0-total)
// tracks how many keys of the sequence have been correctly entered in a
// row, so callers can render a "you're on the right track" indicator.
export function useSecretGarage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Plain closure variable, not React state - onKeyDown reads/writes it
    // directly on every keystroke, so it can't go stale between renders.
    let step = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      step = key === KONAMI_CODE[step] ? step + 1 : key === KONAMI_CODE[0] ? 1 : 0;

      if (step === KONAMI_CODE.length) {
        step = 0;
        setProgress(0);
        // The explicit filename avoids relying on directory-index behavior,
        // which Amplify's rewrite rules for extensionless paths may not give.
        window.location.href = "/garage/index.html";
        return;
      }

      setProgress(step);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { progress, total: KONAMI_CODE.length };
}
