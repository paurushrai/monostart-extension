import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { WidgetItem } from '../types';

interface Counts {
  mainItems: number;
  groups: number;
  linksInsideGroups: number;
  headerLinks: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  links: WidgetItem[];
  onConfirm: (clearHeaderToo: boolean) => void;
}

const computeCounts = (links: readonly WidgetItem[]): Counts => {
  let mainItems = 0;
  let groups = 0;
  let linksInsideGroups = 0;
  let headerLinks = 0;
  for (const l of links) {
    if (l.isHeaderLink) {
      headerLinks += 1;
      continue;
    }
    if (l.type === 'group') {
      groups += 1;
      linksInsideGroups += (l as { links?: unknown[] }).links?.length ?? 0;
      continue;
    }
    mainItems += 1;
  }
  return { mainItems, groups, linksInsideGroups, headerLinks };
};

export default function ClearDashboardModal({ open, onClose, links, onConfirm }: Readonly<Props>) {
  const { t } = useTranslation();
  const [clearHeaderToo, setClearHeaderToo] = useState(false);
  const counts = computeCounts(links);

  useEffect(() => {
    if (!open) setClearHeaderToo(false);
  }, [open]);

  const widgetTotal = counts.mainItems + counts.groups;
  const willDeleteHeader = clearHeaderToo ? counts.headerLinks : 0;
  const nothingToClear = widgetTotal === 0 && (!clearHeaderToo || counts.headerLinks === 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            {t('modals.clear.title')}
          </DialogTitle>
          <DialogDescription>
            {t('modals.clear.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-border bg-gray-100 dark:bg-white/5 p-3 space-y-1.5 text-foreground">
            <div className="flex justify-between">
              <span>{t('modals.clear.widgetsGroups')}</span>
              <span className="font-medium">{widgetTotal}</span>
            </div>
            {counts.linksInsideGroups > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground pl-3">
                <span>{t('modals.clear.linksInsideGroups')}</span>
                <span>{counts.linksInsideGroups}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5">
              <span>{t('modals.clear.headerBarLinks')}</span>
              <span className="font-medium">{counts.headerLinks}</span>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              checked={clearHeaderToo}
              onChange={(e) => setClearHeaderToo(e.target.checked)}
              className="mt-0.5 accent-destructive w-4 h-4 cursor-pointer"
            />
            <span>
              <span className="text-foreground font-medium">{t('modals.clear.alsoClearHeaderLabel')}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                {t('modals.clear.alsoClearHeaderDesc')}
              </span>
            </span>
          </label>

          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-destructive text-xs">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              {widgetTotal > 0 && (
                <Trans
                  i18nKey="modals.clear.widgetGroups"
                  count={widgetTotal}
                  components={{ strong: <strong /> }}
                />
              )}
              {widgetTotal > 0 && willDeleteHeader > 0 && t('modals.clear.andConnector')}
              {willDeleteHeader > 0 && (
                <Trans
                  i18nKey="modals.clear.headerLinks"
                  count={willDeleteHeader}
                  components={{ strong: <strong /> }}
                />
              )}
              {(widgetTotal > 0 || willDeleteHeader > 0) && t('modals.clear.cancelRestores')}
              {nothingToClear && t('modals.clear.nothingToClear')}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('modals.clear.cancelButton')}
          </Button>
          <Button
            size="sm"
            disabled={nothingToClear}
            onClick={() => { onConfirm(clearHeaderToo); onClose(); }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 size={14} className="mr-1.5" />
            {clearHeaderToo ? t('modals.clear.clearEverything') : t('modals.clear.clearWidgets')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
