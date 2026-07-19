"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 active:scale-90"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <Sun
        size={15}
        className="absolute transition-all duration-300"
        style={{
          opacity: theme === "light" ? 1 : 0,
          transform: `rotate(${theme === "light" ? "0deg" : "90deg"}) scale(${theme === "light" ? 1 : 0.5})`,
        }}
      />
      <Moon
        size={15}
        className="absolute transition-all duration-300"
        style={{
          opacity: theme === "dark" ? 1 : 0,
          transform: `rotate(${theme === "dark" ? "0deg" : "-90deg"}) scale(${theme === "dark" ? 1 : 0.5})`,
        }}
      />
    </button>
  );
}
