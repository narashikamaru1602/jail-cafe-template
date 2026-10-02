import { useEffect, useState } from "react";

/** Mirrors the user's `prefers-reduced-motion` OS/browser setting.
 *
 *  On the client the initial value is read synchronously so callers that must
 *  decide on their FIRST render/effect (like the intro gatekeeper) get the
 *  correct answer immediately instead of one commit late. During SSR the
 *  value is `false`, which matches the server-rendered markup (the intro
 *  overlay is a plain black panel either way — no hydration mismatch). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
