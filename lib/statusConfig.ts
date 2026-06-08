import type { Status } from '@/types/topology';

export interface StatusConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  label: string;
  edgeStyle: 'solid' | 'dashed';
}

export const STATUS_CONFIG: Record<Status, StatusConfig> = {
  operational: {
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: 'rgba(52, 211, 153, 0.45)',
    glowColor: 'rgba(52, 211, 153, 0.35)',
    label: 'Operational',
    edgeStyle: 'solid',
  },
  investigation: {
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.08)',
    borderColor: 'rgba(251, 191, 36, 0.45)',
    glowColor: 'rgba(251, 191, 36, 0.28)',
    label: 'Under Investigation',
    edgeStyle: 'dashed',
  },
  fault: {
    color: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.08)',
    borderColor: 'rgba(248, 113, 113, 0.55)',
    glowColor: 'rgba(248, 113, 113, 0.4)',
    label: 'Fault',
    edgeStyle: 'dashed',
  },
};
