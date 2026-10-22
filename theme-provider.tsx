"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProviderProps } from "next-themes/dist/types"

type Theme = "dark" | "light" | "system"

type ThemeContextType = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  value: _value,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("ja-pools-theme")
        if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
          return savedTheme
        }
      } catch {
        /* ignore */
      }
    }
    return (defaultTheme as Theme) || "system"
  })

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")

  useEffect(() => {
    const root = window.document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = () => {
      root.classList.remove("light", "dark")
      const effective: "dark" | "light" =
        theme === "system" ? (media.matches ? "dark" : "light") : theme
      root.classList.add(effective)
      setResolvedTheme(effective)
    }

    applyTheme()
    media.addEventListener("change", applyTheme)
    return () => media.removeEventListener("change", applyTheme)
  }, [theme])

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme: (next: Theme) => {
      try {
        localStorage.setItem("ja-pools-theme", next)
      } catch {
        /* ignore */
      }
      setThemeState(next)
    },
  }

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
