import { useState, useMemo, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { ChevronDown, Check, LayoutGrid, Bookmark, Folder } from 'lucide-react';
import { saveItem } from '../lib/itemRepository';
import { siteFaviconUrl } from '../lib/favicon';
import { deriveSiteName } from '../lib/siteName';

interface GroupRef {
  id: string;
  title: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAfterAdd?: () => void;
  groups?: GroupRef[];
}

const AddLinkModal = ({ open, onClose, onAfterAdd, groups = [] }: Readonly<Props>) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationLabel, LocationIcon } = useMemo(() => {
    if (location === 'dashboard') return { locationLabel: t('modals.addLink.locationMainDashboard'), LocationIcon: LayoutGrid };
    if (location === 'header') return { locationLabel: t('modals.addLink.locationHeader'), LocationIcon: Bookmark };
    const group = groups.find((s) => s.id === location);
    return { locationLabel: group ? t('modals.addLink.locationGroup', { title: group.title }) : t('modals.addLink.locationMainDashboard'), LocationIcon: Folder };
  }, [location, groups, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    let finalTitle = title.trim();
    let faviconUrl = '';
    try {
      faviconUrl = siteFaviconUrl(finalUrl);
    } catch {
      /* favicon is best-effort */
    }
    if (!finalTitle) finalTitle = deriveSiteName(finalUrl);

    setIsSubmitting(true);

    const isHeader = location === 'header';
    const groupId = (location !== 'dashboard' && location !== 'header') ? location : undefined;

    await saveItem({
      url: finalUrl,
      title: finalTitle,
      favicon: faviconUrl,
      type: 'link',
      theme: 'default',
      viewMode: 'icon',
      w: 1,
      h: 1,
      isHeaderLink: isHeader
    }, groupId);

    setIsSubmitting(false);
    setUrl('');
    setTitle('');
    setLocation('dashboard');
    onClose();
    onAfterAdd?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('modals.addLink.title')}</DialogTitle>
          <DialogDescription>
            {t('modals.addLink.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="url">{t('modals.addLink.urlLabel')}</Label>
            <Input
              id="url"
              placeholder={t('modals.addLink.urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t('modals.addLink.titleLabel')}</Label>
            <Input
              id="title"
              placeholder={t('modals.addLink.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location-trigger">{t('modals.addLink.locationLabel')}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="location-trigger"
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-8 px-3 font-normal text-xs"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <LocationIcon size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="truncate">{locationLabel}</span>
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground shrink-0 opacity-60" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[260px] overflow-y-auto"
              >
                <DropdownMenuItem onClick={() => setLocation('dashboard')} className="text-sm">
                  <LayoutGrid size={14} className="mr-2 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1">{t('modals.addLink.locationMainDashboard')}</span>
                  {location === 'dashboard' && <Check size={14} className="ml-2 text-primary" aria-hidden="true" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('header')} className="text-sm">
                  <Bookmark size={14} className="mr-2 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1">{t('modals.addLink.locationHeader')}</span>
                  {location === 'header' && <Check size={14} className="ml-2 text-primary" aria-hidden="true" />}
                </DropdownMenuItem>
                {groups.length > 0 && <DropdownMenuSeparator />}
                {groups.map((s) => (
                  <DropdownMenuItem key={s.id} onClick={() => setLocation(s.id)} className="text-sm">
                    <Folder size={14} className="mr-2 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 truncate">{t('modals.addLink.locationFolder', { title: s.title })}</span>
                    {location === s.id && <Check size={14} className="ml-2 text-primary shrink-0" aria-hidden="true" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-2"
              disabled={isSubmitting}
            >
              {t('modals.addLink.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !url.trim()}>
              {t('modals.addLink.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkModal;
