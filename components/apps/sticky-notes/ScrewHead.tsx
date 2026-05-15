'use client';

interface ScrewHeadProps {
  /** Hex background colour of the sticky (tints the screw head) */
  bgColor: string;
  /** Whether this screw is the one the note currently hangs from */
  active: boolean;
  size?: number;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

/**
 * SVG Phillips-head screw.
 * Active screw looks "driven in" — darker, recessed, slot more prominent.
 * Inactive screws look raised and shiny, inviting a click.
 */
export function ScrewHead({ bgColor, active, size = 15, onClick, onMouseDown }: ScrewHeadProps) {
  const r = size / 2;
  const cx = r;
  const cy = r;

  // Slot dimensions — slightly narrower/shorter when driven in
  const slotW = active ? size * 0.16 : size * 0.14;
  const slotL = active ? size * 0.62 : size * 0.58;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={onMouseDown}
      title={active ? 'current colour' : 'change colour'}
      style={{ width: size, height: size, flexShrink: 0 }}
      className="relative transition-transform hover:scale-110 focus:outline-none"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Metallic rim gradient — light top-left, dark bottom-right */}
          <radialGradient
            id={`rim-${bgColor.replace('#', '')}-${active ? 'a' : 'i'}`}
            cx="35%"
            cy="30%"
            r="65%"
          >
            <stop offset="0%"   stopColor={active ? '#888' : '#ddd'} />
            <stop offset="60%"  stopColor={active ? '#555' : '#aaa'} />
            <stop offset="100%" stopColor={active ? '#333' : '#777'} />
          </radialGradient>

          {/* Inner disc gradient — colour-tinted, recessed when active */}
          <radialGradient
            id={`disc-${bgColor.replace('#', '')}-${active ? 'a' : 'i'}`}
            cx="38%"
            cy="33%"
            r="65%"
          >
            <stop offset="0%"   stopColor={active ? blendWithWhite(bgColor, 0.12) : blendWithWhite(bgColor, 0.55)} />
            <stop offset="100%" stopColor={active ? darken(bgColor, 0.28) : bgColor} />
          </radialGradient>

          {active && (
            <filter id="screw-inset">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.4" floodColor="#000" floodOpacity="0.5" />
            </filter>
          )}
        </defs>

        {/* Outer metallic rim */}
        <circle
          cx={cx}
          cy={cy}
          r={r - 0.5}
          fill={`url(#rim-${bgColor.replace('#', '')}-${active ? 'a' : 'i'})`}
          style={active ? undefined : { filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))' }}
        />

        {/* Inner colour disc */}
        <circle
          cx={cx}
          cy={cy + (active ? 0.3 : 0)}
          r={r - 2.2}
          fill={`url(#disc-${bgColor.replace('#', '')}-${active ? 'a' : 'i'})`}
          style={active ? { filter: 'url(#screw-inset)' } : undefined}
        />

        {/* Phillips slot — horizontal bar */}
        <rect
          x={cx - slotL / 2}
          y={cy - slotW / 2}
          width={slotL}
          height={slotW}
          rx={slotW / 2}
          fill={active ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.30)'}
        />

        {/* Phillips slot — vertical bar */}
        <rect
          x={cx - slotW / 2}
          y={cy - slotL / 2}
          width={slotW}
          height={slotL}
          rx={slotW / 2}
          fill={active ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.30)'}
        />

        {/* Specular highlight on raised screws */}
        {!active && (
          <ellipse
            cx={cx - r * 0.18}
            cy={cy - r * 0.22}
            rx={r * 0.28}
            ry={r * 0.18}
            fill="rgba(255,255,255,0.55)"
          />
        )}
      </svg>
    </button>
  );
}

// ── colour helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function blendWithWhite(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}
