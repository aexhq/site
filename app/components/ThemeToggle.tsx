"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "aex-theme";
const darkModeQuery = "(prefers-color-scheme: dark)";

function preferredTheme(): Theme {
  const appliedTheme = document.documentElement.dataset.theme;
  if (appliedTheme === "light" || appliedTheme === "dark") {
    return appliedTheme;
  }

  return window.matchMedia(darkModeQuery).matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const preference = window.matchMedia(darkModeQuery);

    function syncTheme() {
      let storedTheme: string | null = null;
      try {
        storedTheme = window.localStorage.getItem(storageKey);
      } catch {
        // Browser storage can be unavailable in restricted browsing modes.
      }

      const nextTheme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : preference.matches
            ? "dark"
            : "light";
      document.documentElement.dataset.theme = nextTheme;
      setTheme(nextTheme);
    }

    syncTheme();
    preference.addEventListener("change", syncTheme);
    return () => preference.removeEventListener("change", syncTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = preferredTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {
      // The active page still changes theme when persistence is unavailable.
    }
    setTheme(nextTheme);
  }

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === "dark" ? "☀" : "☾"}
      </span>
      <span>{nextTheme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
