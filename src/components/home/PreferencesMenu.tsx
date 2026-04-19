import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Moon, Settings, Sun } from 'lucide-react';
import { useAppStore } from '$/store/app-store';

type Theme = 'light' | 'dark' | 'system';

export function PreferencesMenu() {
  const { t } = useTranslation('home');
  const { t: tc, i18n } = useTranslation('common');
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const language = useAppStore((s) => s.language);
  const setLanguageStore = useAppStore((s) => s.setLanguage);
  const setLanguage = (lang: string) => {
    void i18n.changeLanguage(lang);
    setLanguageStore(lang);
  };
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="statusbar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Settings size={12} strokeWidth={1.6} />
        {t('statusbar.preferences')}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-50 mb-2 w-[220px] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border px-[14px] py-[10px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            {t('preferences.appearance')}
          </div>
          <div className="grid grid-cols-3 gap-1 p-2">
            <ThemeOption current={theme} value="light" set={setTheme} label={tc('theme.light')}>
              <Sun size={14} strokeWidth={1.6} />
            </ThemeOption>
            <ThemeOption current={theme} value="dark" set={setTheme} label={tc('theme.dark')}>
              <Moon size={14} strokeWidth={1.6} />
            </ThemeOption>
            <ThemeOption current={theme} value="system" set={setTheme} label={tc('theme.system')}>
              <Monitor size={14} strokeWidth={1.6} />
            </ThemeOption>
          </div>

          <div className="border-t border-border px-[14px] py-[10px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            {t('preferences.language')}
          </div>
          <div className="grid grid-cols-2 gap-1 p-2">
            <LanguageOption
              current={language}
              value="en"
              set={setLanguage}
              label={tc('language.en')}
            />
            <LanguageOption
              current={language}
              value="fr"
              set={setLanguage}
              label={tc('language.fr')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeOption({
  current,
  value,
  set,
  label,
  children,
}: {
  current: Theme;
  value: Theme;
  set: (t: Theme) => void;
  label: string;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => set(value)}
      className={`flex flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border px-2 py-2 text-[11px] font-medium transition-colors ${
        active
          ? 'border-primary bg-accent text-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      {children}
      {label}
    </button>
  );
}

function LanguageOption({
  current,
  value,
  set,
  label,
}: {
  current: string;
  value: string;
  set: (l: string) => void;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => set(value)}
      className={`rounded-[var(--radius-md)] border px-2 py-[6px] text-[12px] font-medium transition-colors ${
        active
          ? 'border-primary bg-accent text-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}
