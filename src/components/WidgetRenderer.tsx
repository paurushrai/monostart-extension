import { memo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import LinkCard from './LinkCard';
import IframeWidget from './IframeWidget';
import GoogleSearchWidget from './widgets/GoogleSearchWidget';
import TodoWidget from './widgets/TodoWidget';
import TimerWidget from './widgets/TimerWidget';
import RemindersWidget from './widgets/RemindersWidget';
import GroupWidget from './widgets/GroupWidget';
import NoteWidget from './widgets/NoteWidget';
import ImageWidget from './widgets/ImageWidget';
import LabelWidget from './widgets/LabelWidget';
import { WidgetType } from '../lib/widgetCatalog';
import { useDashboardActions, type DashboardActions } from '../contexts/dashboardActions';
import type {
  DisplayItem,
  DragPlaceholder,
  WidgetItem,
  LinkItem,
  GroupItem,
  IframeItem,
  TodoItem,
  TimerItem,
  RemindersItem,
  NoteItem,
  ImageItem,
  LabelItem,
  GoogleSearchItem,
  DragCoords,
} from '../types';

interface GroupRef {
  id: string;
  title: string;
}

// Item-mutation callbacks (onDelete/onViewModeChange/onUpdateItem/onMoveItem) come
// from DashboardActionsContext, not props — so they aren't drilled through the grid.
interface Props {
  item: DisplayItem;
  isEditing: boolean;
  openInNewTab?: boolean;
  groups?: GroupRef[];
  activeDragGroupId: string | null;
  dragCursorCoords: DragCoords | null;
  draggedItem: WidgetItem | null;
  onInnerDragStart: (link: LinkItem, groupId: string) => void;
  onInnerDrag: (link: LinkItem, groupId: string, x: number, y: number) => void;
  onInnerDragStop: (link: LinkItem, groupId: string, x: number, y: number) => void;
}

const isPlaceholder = (item: DisplayItem): item is DragPlaceholder =>
  item.id === 'drag-out-placeholder' || item.id === 'drag-placeholder';

// Type → renderer lookup. Replaces a 10-case switch: adding a widget is now one
// new entry (open for extension) rather than editing dispatch logic, and the map
// can be asserted complete in tests. Each entry mirrors its former switch case.
type RenderProps = Omit<Props, 'item'> & DashboardActions & { item: WidgetItem };
type WidgetRender = (p: RenderProps) => ReactElement;

// Default renderer; also the fallback for unknown types (matches the prior switch
// default). Held as a named const so the fallback isn't a possibly-undefined lookup.
const renderLink: WidgetRender = ({ item, onDelete, onViewModeChange, onUpdateItem, isEditing, openInNewTab, groups, onMoveItem }) =>
  <LinkCard
    item={item as LinkItem}
    onDelete={onDelete}
    onViewModeChange={onViewModeChange}
    onUpdateItem={onUpdateItem}
    isEditing={isEditing}
    openInNewTab={openInNewTab}
    groups={groups}
    onMoveItem={onMoveItem}
    parentId={undefined}
  />;

const WIDGET_RENDERERS: Record<string, WidgetRender> = {
  [WidgetType.GOOGLE_SEARCH]: ({ item, onDelete, onUpdateItem, isEditing }) =>
    <GoogleSearchWidget item={item as GoogleSearchItem} onDelete={onDelete} onUpdateItem={onUpdateItem} isEditing={isEditing} />,
  [WidgetType.IFRAME]: ({ item, onDelete, isEditing }) =>
    <IframeWidget item={item as IframeItem} onDelete={onDelete} isEditing={isEditing} />,
  [WidgetType.TODO]: ({ item, onDelete, isEditing }) =>
    <TodoWidget item={item as TodoItem} onDelete={onDelete} isEditing={isEditing} />,
  [WidgetType.TIMER]: ({ item, onDelete, isEditing }) =>
    <TimerWidget item={item as TimerItem} onDelete={onDelete} isEditing={isEditing} />,
  [WidgetType.REMINDERS]: ({ item, onDelete, isEditing }) =>
    <RemindersWidget item={item as RemindersItem} onDelete={onDelete} isEditing={isEditing} />,
  [WidgetType.NOTE]: ({ item, onDelete, onUpdateItem, isEditing }) =>
    <NoteWidget item={item as NoteItem} onDelete={onDelete} onUpdateItem={onUpdateItem} isEditing={isEditing} />,
  [WidgetType.IMAGE]: ({ item, onDelete, onUpdateItem, isEditing }) =>
    <ImageWidget item={item as ImageItem} onDelete={onDelete} onUpdateItem={onUpdateItem} isEditing={isEditing} />,
  [WidgetType.LABEL]: ({ item, onDelete, onUpdateItem, isEditing }) =>
    <LabelWidget item={item as LabelItem} onDelete={onDelete} onUpdateItem={onUpdateItem} isEditing={isEditing} />,
  [WidgetType.GROUP]: ({ item, onDelete, onUpdateItem, isEditing, openInNewTab, groups, onMoveItem, activeDragGroupId, dragCursorCoords, draggedItem, onInnerDragStart, onInnerDrag, onInnerDragStop }) =>
    <GroupWidget
      item={item as GroupItem}
      onDelete={onDelete}
      onUpdateItem={onUpdateItem}
      isEditing={isEditing}
      openInNewTab={openInNewTab}
      groups={groups}
      onMoveItem={onMoveItem}
      isDraggedOver={activeDragGroupId === item.id}
      dragCursorCoords={dragCursorCoords}
      onInnerDragStart={onInnerDragStart}
      onInnerDrag={onInnerDrag}
      onInnerDragStop={onInnerDragStop}
      draggedItem={draggedItem}
    />,
  [WidgetType.LINK]: renderLink,
};

function WidgetRendererInner(props: Readonly<Props>) {
  const actions = useDashboardActions();
  const { t } = useTranslation();
  const { item } = props;
  if (isPlaceholder(item)) {
    return (
      <div className="w-full h-full rounded-lg border-2 border-dashed flex items-center justify-center bg-primary/5 transition-all duration-300 animate-pulse border-primary px-3 text-center select-none">
        <span className="text-2xs font-semibold text-primary block w-full text-center">
          {item.w === 1 ? t('widgets.placeholder.place') : t('widgets.placeholder.dropToPlace')}
        </span>
      </div>
    );
  }

  const linkItem = item as WidgetItem;
  const render = WIDGET_RENDERERS[linkItem.type] ?? renderLink;
  return render({ ...props, ...actions, item: linkItem });
}

const WidgetRenderer = memo(WidgetRendererInner, (prev, next) => {
  // Item-mutation callbacks now come from a stable context, so they're not compared.
  if (prev.item !== next.item) return false;
  if (prev.isEditing !== next.isEditing) return false;
  if (prev.openInNewTab !== next.openInNewTab) return false;

  if (next.item.type === 'group') {
    if (prev.activeDragGroupId !== next.activeDragGroupId) return false;
    if (prev.dragCursorCoords !== next.dragCursorCoords) return false;
    if (prev.draggedItem !== next.draggedItem) return false;
    if (prev.groups !== next.groups) return false;
    if (prev.onInnerDragStart !== next.onInnerDragStart) return false;
    if (prev.onInnerDrag !== next.onInnerDrag) return false;
    if (prev.onInnerDragStop !== next.onInnerDragStop) return false;
  }

  return true;
});

export default WidgetRenderer;
