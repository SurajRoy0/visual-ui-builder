"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => { };

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const currentTheme = mounted ? (resolvedTheme || theme) : "dark";
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return {
    theme: currentTheme,
    rawTheme: theme,
    resolvedTheme,
    systemTheme,
    isDark,
    toggleTheme,
    setTheme,
    mounted,
  };
}
