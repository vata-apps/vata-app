import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '$components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '$components/ui/dropdown-menu';
import { useAppStore } from '$/store/app-store';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const setLanguage = useAppStore((s) => s.setLanguage);

  function handleChange(lang: string) {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('language.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChange('en')}>{t('language.en')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange('fr')}>{t('language.fr')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
