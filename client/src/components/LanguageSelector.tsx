import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "es", name: "Espa\u00F1ol", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "fr", name: "Fran\u00E7ais", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "de", name: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "zh", name: "\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "ja", name: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "pt", name: "Portugu\u00EAs", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "ru", name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "ar", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "hi", name: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div ref={ref} className="fixed bottom-6 left-6 z-50">
      {/* Floating globe button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#0A2540] hover:bg-[#0d3050] text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 border border-white/10"
        title="Change language"
      >
        <Globe className="w-4 h-4 text-[#C9A227]" />
        <span className="text-sm font-medium">{current.flag} {current.name}</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Language</p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {languages.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-3 text-sm transition-colors ${
                    isActive
                      ? "bg-[#C9A227]/10 text-[#0A2540] dark:text-[#C9A227] font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title={lang.name}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className="flex-1">{lang.name}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
