import { Search, Globe, CheckSquare, Clock, Folder, FileText, Image, Type, Bell } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { WidgetItem } from '../types';

export const WidgetType = {
  LINK: 'link',
  GROUP: 'group',
  GOOGLE_SEARCH: 'google-search',
  IFRAME: 'iframe',
  TODO: 'todo',
  TIMER: 'timer',
  NOTE: 'note',
  IMAGE: 'image',
  LABEL: 'label',
  REMINDERS: 'reminders',
} as const;

export type WidgetType = typeof WidgetType[keyof typeof WidgetType];

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

interface WidgetLayoutMeta {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  resizable: boolean;
  placementMin?: { minW?: number; minH?: number };
}

export interface WidgetMeta {
  type: WidgetType;
  addable: boolean;
  nameKey?: string;
  descriptionKey?: string;
  icon?: LucideIcon;
  defaults?: Partial<WidgetItem>;
  layout: WidgetLayoutMeta;
}

const WIDGETS = [
  {
    type: WidgetType.LINK,
    addable: false,
    layout: { minW: 1, minH: 1, maxW: 6, maxH: 1, resizable: true },
  },
  {
    type: WidgetType.GOOGLE_SEARCH,
    addable: true,
    nameKey: 'widgets.catalog.googleSearch.name',
    descriptionKey: 'widgets.catalog.googleSearch.description',
    icon: Search,
    defaults: { w: 6, h: 1, variant: 'bar' },
    layout: { minW: 6, maxW: 8, minH: 1, maxH: 4, resizable: true },
  },
  {
    type: WidgetType.GROUP,
    addable: true,
    nameKey: 'widgets.catalog.group.name',
    descriptionKey: 'widgets.catalog.group.description',
    icon: Folder,
    defaults: { w: 3, h: 4, borderColor: '200 73% 52%', links: [] },
    layout: { minW: 3, minH: 4, resizable: true },
  },
  {
    type: WidgetType.REMINDERS,
    addable: true,
    nameKey: 'widgets.catalog.reminders.name',
    descriptionKey: 'widgets.catalog.reminders.description',
    icon: Bell,
    defaults: { w: 4, h: 4 },
    layout: { minW: 4, minH: 4, resizable: true },
  },
  {
    type: WidgetType.TODO,
    addable: true,
    nameKey: 'widgets.catalog.todo.name',
    descriptionKey: 'widgets.catalog.todo.description',
    icon: CheckSquare,
    defaults: { w: 3, h: 3 },
    layout: { minW: 3, minH: 3, resizable: true },
  },
  {
    type: WidgetType.TIMER,
    addable: true,
    nameKey: 'widgets.catalog.timer.name',
    descriptionKey: 'widgets.catalog.timer.description',
    icon: Clock,
    defaults: { w: 3, h: 3 },
    layout: { minW: 3, minH: 3, resizable: true },
  },
  {
    type: WidgetType.NOTE,
    addable: true,
    nameKey: 'widgets.catalog.note.name',
    descriptionKey: 'widgets.catalog.note.description',
    icon: FileText,
    defaults: { w: 3, h: 3, content: '', noteColor: 'default' },
    layout: { minW: 3, minH: 3, resizable: true },
  },
  {
    type: WidgetType.IMAGE,
    addable: true,
    nameKey: 'widgets.catalog.image.name',
    descriptionKey: 'widgets.catalog.image.description',
    icon: Image,
    defaults: { w: 4, h: 3, url: '', fit: 'cover' },
    layout: { minW: 4, minH: 3, resizable: true },
  },
  {
    type: WidgetType.LABEL,
    addable: true,
    nameKey: 'widgets.catalog.label.name',
    descriptionKey: 'widgets.catalog.label.description',
    icon: Type,
    defaults: { w: 2, h: 1, align: 'left', size: 'text-3xl', fontWeight: 'font-bold', opacity: 'opacity-100' },
    layout: { minW: 2, minH: 1, resizable: true },
  },
  {
    type: WidgetType.IFRAME,
    addable: true,
    nameKey: 'widgets.catalog.iframe.name',
    descriptionKey: 'widgets.catalog.iframe.description',
    icon: Globe,
    defaults: { w: 3, h: 3, url: 'https://www.google.com' },
    layout: { minW: 3, minH: 3, resizable: true },
  },
] as const satisfies readonly WidgetMeta[];

const META_BY_TYPE: Record<string, WidgetMeta> =
  Object.fromEntries(WIDGETS.map((w) => [w.type, w]));

const FALLBACK_LAYOUT: WidgetLayoutMeta = { minW: 1, minH: 1, resizable: true };

export const WIDGET_CATALOG: readonly WidgetMeta[] = WIDGETS.filter((w) => w.addable);

export const getWidgetMeta = (type: string | undefined): WidgetMeta | undefined =>
  type === undefined ? undefined : META_BY_TYPE[type];

export const getWidgetLayout = (type: string | undefined): WidgetLayoutMeta =>
  (type !== undefined && META_BY_TYPE[type]?.layout) || FALLBACK_LAYOUT;

export const getWidgetMinSize = (type: string | undefined): { minW: number; minH: number } => {
  const layout = getWidgetLayout(type);
  return {
    minW: layout.placementMin?.minW ?? layout.minW ?? 1,
    minH: layout.placementMin?.minH ?? layout.minH ?? 1,
  };
};

export const RESIZABLE_TYPES: ReadonlySet<string> = new Set(
  WIDGETS.filter((w) => w.layout?.resizable).map((w) => w.type)
);
