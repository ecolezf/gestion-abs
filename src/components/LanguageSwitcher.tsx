import { useI18n } from '@/i18n/I18nContext';
import { languages } from '@/i18n/translations';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () =>
      document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = languages.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
      >
        <Globe className="w-4 h-4" />
        <span>{current.flag}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 end-0 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[140px] z-[99999]">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full text-start px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                lang === l.code
                  ? 'text-teal-600 font-semibold bg-teal-50'
                  : 'text-slate-700'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}