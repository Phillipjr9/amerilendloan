import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    // i18n automatically triggers re-renders in all components using useTranslation()
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">Language:</span>
        </div>
        
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            {languages.map((lang) => (
              <SelectItem 
                key={lang.code} 
                value={lang.code}
                className="text-white hover:bg-slate-600 cursor-pointer"
              >
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
