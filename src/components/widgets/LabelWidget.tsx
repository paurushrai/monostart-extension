import { useState, useRef } from 'react';
import { Type, Trash2, Settings, AlignLeft, AlignCenter, AlignRight, Check, Bold, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LabelItem } from '../../types';
import { useTranslation } from 'react-i18next';

const FONT_SIZES = [
  { id: 'text-sm', name: 'Small', labelKey: 'widgets.label.fontSizes.sm' },
  { id: 'text-base', name: 'Medium', labelKey: 'widgets.label.fontSizes.base' },
  { id: 'text-lg', name: 'Large', labelKey: 'widgets.label.fontSizes.lg' },
  { id: 'text-xl', name: 'Extra Large', labelKey: 'widgets.label.fontSizes.xl' },
  { id: 'text-2xl', name: '2X Large', labelKey: 'widgets.label.fontSizes.xl2' },
  { id: 'text-3xl', name: '3X Large', labelKey: 'widgets.label.fontSizes.xl3' },
  { id: 'text-4xl', name: '4X Large', labelKey: 'widgets.label.fontSizes.xl4' },
  { id: 'text-5xl', name: '5X Large', labelKey: 'widgets.label.fontSizes.xl5' },
  { id: 'text-6xl', name: '6X Large', labelKey: 'widgets.label.fontSizes.xl6' },
  { id: 'text-7xl', name: '7X Large', labelKey: 'widgets.label.fontSizes.xl7' },
  { id: 'text-8xl', name: '8X Large', labelKey: 'widgets.label.fontSizes.xl8' },
  { id: 'text-9xl', name: '9X Large', labelKey: 'widgets.label.fontSizes.xl9' },
  { id: 'text-[10rem]', name: '10X Large', labelKey: 'widgets.label.fontSizes.xl10' },
  { id: 'text-[12rem]', name: '12X Large', labelKey: 'widgets.label.fontSizes.xl12' },
];

const FONT_WEIGHTS = [
  { id: 'font-thin', name: 'Thin', labelKey: 'widgets.label.fontWeights.thin' },
  { id: 'font-light', name: 'Light', labelKey: 'widgets.label.fontWeights.light' },
  { id: 'font-normal', name: 'Regular', labelKey: 'widgets.label.fontWeights.regular' },
  { id: 'font-medium', name: 'Medium', labelKey: 'widgets.label.fontWeights.medium' },
  { id: 'font-semibold', name: 'Semi Bold', labelKey: 'widgets.label.fontWeights.semibold' },
  { id: 'font-bold', name: 'Bold', labelKey: 'widgets.label.fontWeights.bold' },
  { id: 'font-extrabold', name: 'Extra Bold', labelKey: 'widgets.label.fontWeights.extrabold' },
  { id: 'font-black', name: 'Black', labelKey: 'widgets.label.fontWeights.black' },
];

const OPACITIES = [
  { id: 'opacity-100', name: '100% (Bright)', labelKey: 'widgets.label.opacities.full' },
  { id: 'opacity-80', name: '80%', labelKey: 'widgets.label.opacities.p80' },
  { id: 'opacity-60', name: '60%', labelKey: 'widgets.label.opacities.p60' },
  { id: 'opacity-40', name: '40% (Muted)', labelKey: 'widgets.label.opacities.muted' },
];

interface Props {
  item: LabelItem;
  onDelete: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<LabelItem>) => void;
  isEditing: boolean;
}

const LabelWidget = ({ item, onDelete, onUpdateItem, isEditing }: Readonly<Props>) => {
  const {
    text = 'Google',
    align = 'left',
    size = 'text-3xl',
    fontWeight = 'font-bold',
    opacity = 'opacity-100',
    cardStyle = false,
  } = item;
  const { t } = useTranslation();

  const [isEditingText, setIsEditingText] = useState(false);
  const [inputText, setInputText] = useState(text);
  const [prevText, setPrevText] = useState(text);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Resync the draft when the stored text changes — a render-phase adjustment
  // (per React docs) rather than an effect, to avoid a cascading re-render.
  if (text !== prevText) {
    setPrevText(text);
    setInputText(text);
  }

  const handleTextClick = () => {
    if (isEditing) {
      setIsEditingText(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSaveText = () => {
    setIsEditingText(false);
    const trimmed = inputText.trim();
    onUpdateItem(item.id, { text: trimmed || t('widgets.label.defaultText') });
  };

  const alignClass = align === 'center'
    ? 'text-center justify-center' 
    : align === 'right' 
      ? 'text-right justify-end' 
      : 'text-left justify-start';

  return (
    <article
      className={`w-full h-full relative group/label flex items-center transition-all duration-200 rounded-lg ${alignClass} ${
        cardStyle
          ? 'card-base bg-card/65 backdrop-blur-md border border-border'
          : `bg-transparent border border-dashed ${isEditing && !isEditingText ? 'border-transparent hover:border-border/40' : 'border-transparent'}`
      } ${
        isEditing && !isEditingText
          ? 'drag-handle cursor-grab active:cursor-grabbing'
          : ''
      }`}
    >

      {isEditing && !isEditingText && (
        <div role="toolbar" aria-label={t('widgets.label.actionsAriaLabel')} className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover/label:opacity-100 transition-opacity duration-200 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={(e) => e.stopPropagation()}
                title={t('widgets.label.settings')}
                className="h-7 w-7 rounded bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-foreground hover:text-foreground"
              >
                <Settings size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1">
              <DropdownMenuItem 
                onClick={() => {
                  setIsEditingText(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="flex items-center gap-2 py-1 cursor-pointer text-xs"
              >
                <Type size={12} className="text-muted-foreground" />
                <span>{t('widgets.label.editText')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => onUpdateItem(item.id, { cardStyle: !cardStyle })}
                className="flex items-center justify-between py-1 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded border border-border flex items-center justify-center bg-background shrink-0">
                    {cardStyle && <Check size={10} className="text-primary" />}
                  </div>
                  <span>{t('widgets.label.showCardStyle')}</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 py-1 cursor-pointer text-xs">
                  <Sparkles size={12} className="text-muted-foreground" />
                  <span>{t('widgets.label.fontSize')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-1">
                  {FONT_SIZES.map((fs) => (
                    <DropdownMenuItem
                      key={fs.id}
                      onClick={() => onUpdateItem(item.id, { size: fs.id })}
                      className="flex items-center justify-between py-1 cursor-pointer text-xs"
                    >
                      <span>{t(fs.labelKey)}</span>
                      {size === fs.id && <Check size={12} className="text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 py-1 cursor-pointer text-xs">
                  <AlignLeft size={12} className="text-muted-foreground" />
                  <span>{t('widgets.label.alignment')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-1">
                  <DropdownMenuItem
                    onClick={() => onUpdateItem(item.id, { align: 'left' })}
                    className="flex items-center justify-between py-1 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlignLeft size={12} />
                      <span>{t('widgets.label.alignLeft')}</span>
                    </div>
                    {align === 'left' && <Check size={12} className="text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateItem(item.id, { align: 'center' })}
                    className="flex items-center justify-between py-1 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlignCenter size={12} />
                      <span>{t('widgets.label.alignCenter')}</span>
                    </div>
                    {align === 'center' && <Check size={12} className="text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateItem(item.id, { align: 'right' })}
                    className="flex items-center justify-between py-1 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlignRight size={12} />
                      <span>{t('widgets.label.alignRight')}</span>
                    </div>
                    {align === 'right' && <Check size={12} className="text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 py-1 cursor-pointer text-xs">
                  <Bold size={12} className="text-muted-foreground" />
                  <span>{t('widgets.label.fontWeight')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-1">
                  {FONT_WEIGHTS.map((fw) => (
                    <DropdownMenuItem
                      key={fw.id}
                      onClick={() => onUpdateItem(item.id, { fontWeight: fw.id })}
                      className="flex items-center justify-between py-1 cursor-pointer text-xs"
                    >
                      <span>{t(fw.labelKey)}</span>
                      {fontWeight === fw.id && <Check size={12} className="text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 py-1 cursor-pointer text-xs">
                  <div className="w-3 h-3 rounded-full border border-current opacity-60" />
                  <span className="ml-0.5">{t('widgets.label.opacity')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-1">
                  {OPACITIES.map((op) => (
                    <DropdownMenuItem
                      key={op.id}
                      onClick={() => onUpdateItem(item.id, { opacity: op.id })}
                      className="flex items-center justify-between py-1 cursor-pointer text-xs"
                    >
                      <span>{t(op.labelKey)}</span>
                      {opacity === op.id && <Check size={12} className="text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="flex items-center gap-2 py-1 cursor-pointer text-xs text-red-500 hover:text-red-600 focus:text-red-600"
              >
                <Trash2 size={12} />
                <span>{t('widgets.label.deleteText')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="h-7 w-7 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-500"
            title={t('widgets.deleteWidget')}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )}

      <div className={`px-4 py-2 w-full truncate leading-none ${size} ${fontWeight} ${opacity}`}>
        {isEditingText ? (
          <Input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onBlur={handleSaveText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveText();
              } else if (e.key === 'Escape') {
                setIsEditingText(false);
                setInputText(text);
              }
            }}
            aria-label={t('widgets.label.textAriaLabel')}
            className="h-auto w-full text-foreground p-0 m-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none leading-none bg-transparent border-none rounded-none"
            style={{
              fontSize: 'inherit',
              fontWeight: 'inherit',
              textAlign: align,
              fontFamily: 'inherit'
            }}
          />
        ) : (
          <span
            onClick={handleTextClick}
            className={`truncate select-none ${isEditing ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1' : ''}`}
          >
            {text}
          </span>
        )}
      </div>

    </article>
  );
};

export default LabelWidget;
