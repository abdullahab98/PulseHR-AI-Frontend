import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'fusion_app_theme';
  currentTheme = signal<AppTheme>('light');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem(this.THEME_KEY) as AppTheme | null;
    if (saved === 'dark' || saved === 'light') {
      this.setTheme(saved);
    } else {
      // Default to light
      this.setTheme('light');
    }
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleTheme(): AppTheme {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
