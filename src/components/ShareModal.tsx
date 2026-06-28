import { useEffect, useRef, useState } from 'react';
import { Mail, Check, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  XIcon,
  LinkedInIcon,
  RedditIcon,
  WhatsAppIcon,
  TelegramIcon,
  FacebookIcon,
} from './icons/brand';
import { buildShareUrl, SHARE_URL, SHARE_TEXT, type ShareChannel } from '@/lib/share';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ChannelConfig {
  id: ShareChannel;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  bg: string;
  bordered?: boolean;
}

const CHANNELS: readonly ChannelConfig[] = [
  { id: 'x', label: 'Share on X', Icon: XIcon, bg: '#000000', bordered: true },
  { id: 'linkedin', label: 'Share on LinkedIn', Icon: LinkedInIcon, bg: '#0A66C2' },
  { id: 'reddit', label: 'Share on Reddit', Icon: RedditIcon, bg: '#FF4500' },
  { id: 'whatsapp', label: 'Share on WhatsApp', Icon: WhatsAppIcon, bg: '#25D366' },
  { id: 'telegram', label: 'Share on Telegram', Icon: TelegramIcon, bg: '#229ED9' },
  { id: 'facebook', label: 'Share on Facebook', Icon: FacebookIcon, bg: '#1877F2' },
  { id: 'email', label: 'Share via Email', Icon: Mail, bg: 'hsl(var(--primary))' },
];

const COPIED_RESET_MS = 2000;

export default function ShareModal({ open, onClose }: Readonly<Props>) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const openShare = (channel: ShareChannel): void => {
    const url = buildShareUrl(channel, { url: SHARE_URL, text: SHARE_TEXT });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard blocked (rare in an extension context) — leave state unchanged.
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md focus:outline-none">
        <DialogHeader>
          <DialogTitle>MonoStart</DialogTitle>
          <DialogDescription>Share this item</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-7 gap-2">
          {CHANNELS.map(({ id, label, Icon, bg, bordered }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => openShare(id)}
              style={{ backgroundColor: bg }}
              className={`flex aspect-square w-full items-center justify-center rounded-xl text-white shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card ${
                bordered ? 'border border-border' : ''
              }`}
            >
              <Icon size={20} className="text-white" />
            </button>
          ))}
        </div>

        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-input bg-muted/50 p-1.5 pl-3">
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground" title={SHARE_URL}>
            {SHARE_URL}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Link copied' : 'Copy link'}
            className="flex w-24 shrink-0 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
