/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

export type AppTheme = "dark" | "light";

const STORAGE_KEY = "promptStudioTheme";

export function loadStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export function persistTheme(theme: AppTheme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function applyThemeToDocument(theme: AppTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
}
