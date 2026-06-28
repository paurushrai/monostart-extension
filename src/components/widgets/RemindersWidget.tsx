import { useState, useMemo, useEffect, type FormEvent } from 'react';
import { Bell, Plus, X, Repeat, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWidgetStorage } from '../../hooks/useWidgetStorage';
import WidgetShell from './WidgetShell';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { RemindersItem, ReminderEntry } from '../../types';

interface Props {
  item: RemindersItem;
  onDelete: (id: string) => void;
  isEditing: boolean;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const CUSTOM_MIN_MS = MINUTE_MS;
const CUSTOM_MAX_MS = 365 * DAY_MS;

type CustomUnit = 'm' | 'h' | 'd';

const unitToMs = (unit: CustomUnit): number =>
  unit === 'd' ? DAY_MS : unit === 'h' ? HOUR_MS : MINUTE_MS;

const formatCustomMs = (ms: number, t: (key: string, opts?: Record<string, unknown>) => string): string => {
  const minutes = Math.max(1, Math.round(ms / MINUTE_MS));
  if (minutes >= 1440 && minutes % 1440 === 0) return t('widgets.reminders.everyDay', { count: minutes / 1440 });
  if (minutes >= 60 && minutes % 60 === 0) return t('widgets.reminders.everyHour', { count: minutes / 60 });
  return t('widgets.reminders.everyMin', { count: minutes });
};

const recurrenceLabel = (
  recurrence: ReminderEntry['recurrence'],
  t: (key: string, opts?: Record<string, unknown>) => string,
  customIntervalMs?: number,
): string => {
  switch (recurrence) {
    case 'none': return t('widgets.reminders.recurrenceNone');
    case '30min': return t('widgets.reminders.recurrence30min');
    case 'hourly': return t('widgets.reminders.recurrenceHourly');
    case 'daily': return t('widgets.reminders.recurrenceDaily');
    case 'weekly': return t('widgets.reminders.recurrenceWeekly');
    case 'custom': return customIntervalMs ? formatCustomMs(customIntervalMs, t) : t('widgets.reminders.recurrenceCustom');
  }
};

const RECURRENCE_OPTIONS: ReadonlyArray<ReminderEntry['recurrence']> = [
  'none', '30min', 'hourly', 'daily', 'weekly', 'custom',
];

const defaultDueAt = (): Date => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d;
};

const formatDue = (epochMs: number, t: (key: string, opts?: Record<string, unknown>) => string): string => {
  const d = new Date(epochMs);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return t('widgets.reminders.today', { time });
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const sameAsTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();
  if (sameAsTomorrow) return t('widgets.reminders.tomorrow', { time });
  return t('widgets.reminders.dateTime', { date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), time });
};

const RemindersWidget = ({ item, onDelete, isEditing }: Readonly<Props>) => {
  const { t } = useTranslation();
  const [reminders, saveReminders] = useWidgetStorage<ReminderEntry[]>(`reminders-widget-${item.id}`, []);
  const [text, setText] = useState('');
  const [dueAt, setDueAt] = useState<Date>(defaultDueAt);
  const [recurrence, setRecurrence] = useState<ReminderEntry['recurrence']>('none');
  const [customValue, setCustomValue] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<CustomUnit>('h');
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);

  const sorted = useMemo(
    () => [...reminders].sort((a, b) => a.dueAt - b.dueAt),
    [reminders],
  );

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const upcoming = reminders
      .filter((r) => !r.completed && r.dueAt > now)
      .map((r) => r.dueAt);
    const delay = upcoming.length === 0
      ? 60_000
      : Math.max(50, Math.min(...upcoming) - now + 50);
    const id = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(id);
  }, [reminders, now]);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const due = dueAt.getTime();
    if (Number.isNaN(due)) return;
    const customIntervalMs = recurrence === 'custom'
      ? Math.min(CUSTOM_MAX_MS, Math.max(CUSTOM_MIN_MS, customValue * unitToMs(customUnit)))
      : undefined;
    const entry: ReminderEntry = {
      id: `r-${crypto.randomUUID()}`,
      text: trimmed,
      dueAt: due,
      recurrence,
      ...(customIntervalMs !== undefined && { customIntervalMs }),
    };
    saveReminders((current) => [...current, entry]);
    setText('');
    setDueAt(defaultDueAt());
    setRecurrence('none');
    setCustomValue(1);
    setCustomUnit('h');
  };

  const toggleComplete = (id: string) => {
    saveReminders((current) => current.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const removeOne = (id: string) => {
    saveReminders((current) => current.filter((r) => r.id !== id));
  };

  return (
    <WidgetShell icon={Bell} title={item.title || t('widgets.reminders.defaultTitle')} isEditing={isEditing} onDelete={() => onDelete(item.id)}>
      <ul className="flex-1 overflow-y-auto p-1 space-y-1 list-none">
        {sorted.length === 0 && (
          <li className="text-xs text-muted-foreground text-center mt-4">{t('widgets.reminders.empty')}</li>
        )}
        {sorted.map((r) => {
          const overdue = !r.completed && r.dueAt <= now;
          return (
            <li
              key={r.id}
              className={`flex items-start gap-2 px-2 py-1 rounded group/item ${overdue ? 'bg-red-50 dark:bg-red-900/15' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              {r.recurrence === 'none' ? (
                <input
                  type="checkbox"
                  checked={!!r.completed}
                  onChange={() => toggleComplete(r.id)}
                  aria-label={t('widgets.reminders.toggleAriaLabel', { text: r.text, status: r.completed ? t('widgets.reminders.statusIncomplete') : t('widgets.reminders.statusComplete') })}
                  className="mt-1 accent-primary cursor-pointer w-3.5 h-3.5 shrink-0"
                />
              ) : (
                <Repeat size={12} className="text-primary mt-1 shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm break-words ${r.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {r.text}
                </p>
                <p className={`text-2xs mt-0.5 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                  <time dateTime={new Date(r.dueAt).toISOString()}>{formatDue(r.dueAt, t)}</time>
                  {r.recurrence !== 'none' && <span className="ml-1.5">· {recurrenceLabel(r.recurrence, t, r.customIntervalMs)}</span>}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOne(r.id)}
                className="h-5 w-5 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-transparent transition-opacity shrink-0 mt-0.5"
                title={t('widgets.reminders.deleteReminder')}
              >
                <X size={14} />
              </Button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleAdd} className="p-1.5 border-t border-border shrink-0 bg-gray-50/50 dark:bg-black/10 rounded-b-xl space-y-1">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('widgets.reminders.placeholder')}
          aria-label={t('widgets.reminders.textAriaLabel')}
          className="h-7 w-full bg-gray-100 dark:bg-white/5 border-none rounded-sm px-2.5 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
        />
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0">
            <DateTimePicker value={dueAt} onChange={setDueAt} />
          </div>
          <DropdownMenu open={recurrenceOpen} onOpenChange={setRecurrenceOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                title={t('widgets.reminders.recurrenceTitle')}
                className="h-7 px-2 rounded-sm text-xs font-medium bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 shrink-0"
              >
                {recurrence === 'custom'
                  ? formatCustomMs(customValue * unitToMs(customUnit), t)
                  : recurrenceLabel(recurrence, t)}
                <ChevronDown size={12} className="ml-1 opacity-60" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {RECURRENCE_OPTIONS.map((opt) => {
                if (opt === 'custom') {
                  return (
                    <DropdownMenuItem
                      key={opt}
                      onSelect={(e) => { e.preventDefault(); setRecurrence('custom'); }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-3.5 inline-flex justify-center">
                        {recurrence === 'custom' && <Check size={12} />}
                      </span>
                      <span>{t('widgets.reminders.recurrenceCustom')}</span>
                    </DropdownMenuItem>
                  );
                }
                return (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => setRecurrence(opt)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-3.5 inline-flex justify-center">
                      {recurrence === opt && <Check size={12} />}
                    </span>
                    <span>{recurrenceLabel(opt, t)}</span>
                  </DropdownMenuItem>
                );
              })}
              {recurrence === 'custom' && (
                <div
                  className="border-t border-border mt-1 pt-2 px-2 pb-2 space-y-1.5"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs text-muted-foreground shrink-0">{t('widgets.reminders.every')}</span>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={customValue}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        setCustomValue(Number.isFinite(n) ? Math.max(1, Math.min(365, n)) : 1);
                      }}
                      aria-label={t('widgets.reminders.customIntervalAriaLabel')}
                      className="w-14 h-7 text-xs px-2 bg-gray-100 dark:bg-white/5 border-none rounded-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                    />
                    <Select value={customUnit} onValueChange={(v) => setCustomUnit(v as CustomUnit)}>
                      <SelectTrigger
                        aria-label={t('widgets.reminders.customUnitAriaLabel')}
                        className="h-7 w-[5.5rem] px-2 text-xs bg-gray-100 dark:bg-white/5 border-none rounded-sm shadow-none focus:ring-1 focus:ring-primary focus:ring-offset-0"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="min-w-[6rem]">
                        <SelectItem value="m" className="text-xs">{t('widgets.reminders.unitMinutes')}</SelectItem>
                        <SelectItem value="h" className="text-xs">{t('widgets.reminders.unitHours')}</SelectItem>
                        <SelectItem value="d" className="text-xs">{t('widgets.reminders.unitDays')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-6 px-2 text-2xs w-full"
                    onClick={() => setRecurrenceOpen(false)}
                  >
                    {t('widgets.reminders.saveRecurrence')}
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim()}
            className="h-7 w-7 rounded-sm bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:active:bg-primary/80 disabled:opacity-40 shrink-0"
            title={t('widgets.reminders.addReminder')}
          >
            <Plus size={14} strokeWidth={3} />
          </Button>
        </div>
      </form>
    </WidgetShell>
  );
};

export default RemindersWidget;
