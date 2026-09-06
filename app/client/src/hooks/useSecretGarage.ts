import { useEffect } from "react";

// The Konami code. Case-insensitive on the letter keys since KeyboardEvent.key
// reports "b"/"a" (lowercase) without Shift.
const KONAMI_CODE = [
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
// standalone static page, not a route in this SPA.
export function useSecretGarage() {
  useEffect(() => {
    let buffer: string[] = [];

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buffer = [...buffer, key].slice(-KONAMI_CODE.length);

      if (
        buffer.length === KONAMI_CODE.length &&
        buffer.every((k, i) => k === KONAMI_CODE[i])
      ) {
        buffer = [];
        // The explicit filename avoids relying on directory-index behavior,
        // which Amplify's rewrite rules for extensionless paths may not give.
        window.location.href = "/garage/index.html";
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
