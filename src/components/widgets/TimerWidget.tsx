import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Clock, Plus, X, Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWidgetStorage } from '../../hooks/useWidgetStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WidgetShell from './WidgetShell';
import { computeRemainingMs, selectExpiredTimerIds, anyTimerRunning } from '../../lib/timer';
import { playTimerChime } from '../../lib/chime';
import type { TimerItem, TimerEntry } from '../../types';

const TICK_INTERVAL_MS = 250;

const formatTime = (ms: number): string => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface TimerItemProps {
  timer: TimerEntry;
  now: number;
  onUpdate: (id: number, updates: Partial<TimerEntry>) => void;
  onDelete: (id: number) => void;
}

const TimerItem = ({ timer, now, onUpdate, onDelete }: Readonly<TimerItemProps>) => {
  const { t } = useTranslation();
  // Remaining time is derived from `now` (driven by the widget's single ticker),
  // so each TimerItem is a pure display with no interval of its own.
  const timeLeft = computeRemainingMs(timer, now);

  const handleStart = () => {
    if (timeLeft <= 0) return;
    onUpdate(timer.id, {
      isRunning: true,
      endTime: Date.now() + timeLeft
    });
  };

  const handlePause = () => {
    onUpdate(timer.id, {
      isRunning: false,
      remainingMs: timeLeft,
      endTime: null
    });
  };

  const handleReset = () => {
    onUpdate(timer.id, {
      isRunning: false,
      remainingMs: timer.durationMs,
      endTime: null
    });
  };

  return (
    <li className="flex flex-col gap-1 p-2 bg-gray-50 dark:bg-white/5 rounded-md relative group">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">{timer.label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(timer.id)}
          title={t('widgets.timer.deleteTimer')}
          className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-transparent transition-opacity"
        >
          <X size={12} />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <time className={`text-2xl font-mono font-semibold tracking-tight ${timeLeft === 0 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
          {formatTime(timeLeft)}
        </time>
        <div className="flex items-center gap-1">
          {timer.isRunning ? (
            <Button type="button" size="icon" onClick={handlePause} title={t('widgets.timer.pause')} className="h-7 w-7 p-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/20"><Pause size={14} /></Button>
          ) : (
            <Button type="button" size="icon" onClick={handleStart} title={t('widgets.timer.start')} className="h-7 w-7 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"><Play size={14} className="ml-0.5" /></Button>
          )}
          <Button type="button" size="icon" onClick={handleReset} title={t('widgets.timer.reset')} className="h-7 w-7 p-0 rounded-full bg-gray-200 dark:bg-white/10 text-foreground dark:text-foreground hover:bg-gray-300 dark:hover:bg-white/20"><RotateCcw size={14} /></Button>
        </div>
      </div>
    </li>
  );
};

interface Props {
  item: TimerItem;
  onDelete: (id: string) => void;
  isEditing: boolean;
}

const TimerWidget = ({ item, onDelete, isEditing }: Readonly<Props>) => {
  const { t } = useTranslation();
  const [timers, saveTimers] = useWidgetStorage<TimerEntry[]>(`timer-widget-${item.id}`, []);
  const [newMinutes, setNewMinutes] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const running = anyTimerRunning(timers);

  // One ticker per widget (not one per running timer): refresh `now` only while
  // something is counting down; an idle timer widget runs no interval at all.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [running]);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const mins = parseInt(newMinutes);
    if (!mins || mins <= 0) return;

    const durationMs = mins * 60 * 1000;
    const newTimer: TimerEntry = {
      id: Date.now(),
      label: newLabel.trim() || `${mins} min Timer`,
      durationMs,
      remainingMs: durationMs,
      isRunning: false,
      endTime: null,
    };
    saveTimers((current) => [...current, newTimer]);
    setNewMinutes("");
    setNewLabel("");
  };

  const updateTimer = useCallback((id: number, updates: Partial<TimerEntry>) => {
    saveTimers((current) => current.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [saveTimers]);

  const deleteTimer = useCallback((id: number) => {
    saveTimers((current) => current.filter(t => t.id !== id));
  }, [saveTimers]);

  // Stop any timers that reached zero and chime once. updateTimer clears their
  // isRunning flag, so the next run finds none expired — the effect is idempotent.
  useEffect(() => {
    const expired = selectExpiredTimerIds(timers, now);
    if (expired.length === 0) return;
    expired.forEach((id) => updateTimer(id, { isRunning: false, remainingMs: 0, endTime: null }));
    playTimerChime();
  }, [timers, now, updateTimer]);

  return (
    <WidgetShell icon={Clock} title={item.title || t('widgets.timer.defaultTitle')} isEditing={isEditing} onDelete={() => onDelete(item.id)}>
      <ul className="flex-1 overflow-y-auto p-1 space-y-1 list-none">
        {timers.length === 0 && (
          <li className="text-xs text-muted-foreground text-center mt-4">{t('widgets.timer.empty')}</li>
        )}
        {timers.map(timer => (
          <TimerItem
            key={timer.id}
            timer={timer}
            now={now}
            onUpdate={updateTimer}
            onDelete={deleteTimer}
          />
        ))}
      </ul>

      <form onSubmit={handleAdd} className="p-1.5 border-t border-border shrink-0 bg-gray-50/50 dark:bg-black/10 rounded-b-xl">
        <div className="flex gap-1.5">
          <Input
            type="number"
            min="1"
            max="999"
            value={newMinutes}
            onChange={(e) => setNewMinutes(e.target.value)}
            placeholder={t('widgets.timer.placeholderMin')}
            aria-label={t('widgets.timer.durationAriaLabel')}
            className="h-7 w-14 bg-gray-100 dark:bg-white/5 border-none rounded-sm px-2 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          <Input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={t('widgets.timer.placeholderLabel')}
            aria-label={t('widgets.timer.labelAriaLabel')}
            className="h-7 flex-1 min-w-0 bg-gray-100 dark:bg-white/5 border-none rounded-sm px-2 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMinutes}
            title={t('widgets.timer.addTimer')}
            className="h-7 w-7 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 disabled:opacity-50 rounded-sm"
          >
            <Plus size={14} />
          </Button>
        </div>
      </form>
    </WidgetShell>
  );
};

export default TimerWidget;
