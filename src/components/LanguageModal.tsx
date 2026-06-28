import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LanguageModal({ open, onClose }: Readonly<Props>) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const matches = SUPPORTED_LANGUAGES.filter(
    (l) => !q || l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q),
  );

  const pick = async (code: string): Promise<void> => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md focus:outline-none">
        <DialogHeader>
          <DialogTitle>{t('modals.language.title')}</DialogTitle>
          <DialogDescription>{t('modals.language.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('modals.language.search')}
            aria-label={t('modals.language.search')}
            className="pl-8"
          />
        </div>
        <ul className="max-h-72 overflow-y-auto -mx-1 list-none">
          {matches.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => void pick(l.code)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent focus:outline-none focus:bg-accent"
              >
                <span>{l.name}</span>
                {l.code === language && <Check size={15} className="text-primary" />}
              </button>
            </li>
          ))}
          {matches.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">{t('modals.language.empty')}</li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
