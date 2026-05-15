import type { Tag } from './types';
import { SYSTEM_COLORS } from './tag-color';

export const SEED_TAGS: Tag[] = [
  {
    id: 'q1-urgent',
    label: 'Important + Urgent',
    color: SYSTEM_COLORS['q1-urgent'],
    system: true,
    priority: 0,
  },
  {
    id: 'q2-scheduled',
    label: 'Important, Not Urgent',
    color: SYSTEM_COLORS['q2-scheduled'],
    system: true,
    priority: 1,
  },
  {
    id: 'q3-delegate',
    label: 'Not Important, Urgent',
    color: SYSTEM_COLORS['q3-delegate'],
    system: true,
    priority: 2,
  },
  {
    id: 'q4-later',
    label: 'Not Important, Not Urgent',
    color: SYSTEM_COLORS['q4-later'],
    system: true,
    priority: 3,
  },
];
