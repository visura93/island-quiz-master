import { useLanguage } from "@/contexts/LanguageContext";
import type { SupportedLanguage } from "@/i18n/config";

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; title: string }[] = [
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'si', label: 'සිං', title: 'සිංහල' },
  { code: 'ta', label: 'தமி', title: 'தமிழ்' },
];

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center rounded-lg border border-border bg-background overflow-hidden"
      role="group"
      aria-label="Select language"
    >
      {LANGUAGE_OPTIONS.map(({ code, label, title }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          title={title}
          aria-pressed={language === code}
          className={`
            h-9 px-2.5 text-xs font-medium transition-all duration-200 cursor-pointer
            ${language === code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
