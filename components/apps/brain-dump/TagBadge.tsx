import type { Tag } from '@/lib/brain-dump/types';

interface Props {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  size?: 'sm' | 'xs';
}

export function TagBadge({ tag, onRemove, onClick, active, size = 'sm' }: Props) {
  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        '--tag-color': tag.color,
        backgroundColor: `color-mix(in srgb, ${tag.color} 15%, transparent)`,
        borderColor: `color-mix(in srgb, ${tag.color} 40%, transparent)`,
        color: tag.color,
        opacity: active === false ? 0.45 : 1,
      } as React.CSSProperties}
      className={`inline-flex items-center gap-1 rounded-full border font-medium leading-none select-none transition-opacity ${px} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {tag.label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-70 leading-none"
          aria-label={`Remove ${tag.label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
