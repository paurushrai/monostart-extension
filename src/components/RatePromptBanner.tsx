import { Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface Props {
  onRate: () => void;
  onLater: () => void;
  onDismiss: () => void;
}

export default function RatePromptBanner({ onRate, onLater, onDismiss }: Readonly<Props>) {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(92vw,24rem)] animate-in fade-in slide-in-from-bottom-2">
      <div className="card-base bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-xl p-4 relative">
        <button
          type="button"
          onClick={onLater}
          aria-label={t('ratePrompt.close')}
          className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X size={15} />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <Star size={18} className="text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{t('ratePrompt.title')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t('ratePrompt.message')}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground">
            {t('ratePrompt.dismiss')}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLater}>
            {t('ratePrompt.later')}
          </Button>
          <Button size="sm" onClick={onRate} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Star size={14} className="mr-1.5" />
            {t('ratePrompt.rate')}
          </Button>
        </div>
      </div>
    </div>
  );
}
