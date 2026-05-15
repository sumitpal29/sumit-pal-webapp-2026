// Deterministic HSL color from a string. Saturation and lightness are fixed
// to values that look harmonious on both light and dark backgrounds.
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Hues that clash with skin-tone and accessibility-problematic ranges are
// skipped by mapping the 0-359 wheel into a curated palette of 12 hue stops.
const HUE_STOPS = [200, 160, 270, 30, 180, 340, 55, 230, 110, 310, 15, 250];

export function tagColor(label: string): string {
  const hue = HUE_STOPS[hashCode(label) % HUE_STOPS.length];
  return `hsl(${hue}, 60%, 55%)`;
}

// Fixed colors for the four Eisenhower system tags.
export const SYSTEM_COLORS: Record<string, string> = {
  'q1-urgent': 'hsl(4, 72%, 55%)',       // red
  'q2-scheduled': 'hsl(218, 65%, 58%)',  // blue
  'q3-delegate': 'hsl(38, 78%, 52%)',    // amber
  'q4-later': 'hsl(155, 28%, 48%)',      // muted sage
};
