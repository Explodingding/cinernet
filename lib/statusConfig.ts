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
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)',
    borderColor: 'rgba(5, 150, 105, 0.4)',
    glowColor: 'rgba(5, 150, 105, 0.25)',
    label: 'Operational',
    edgeStyle: 'solid',
  },
  investigation: {
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.4)',
    glowColor: 'rgba(217, 119, 6, 0.2)',
    label: 'Under Investigation',
    edgeStyle: 'dashed',
  },
  fault: {
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.07)',
    borderColor: 'rgba(220, 38, 38, 0.45)',
    glowColor: 'rgba(220, 38, 38, 0.25)',
    label: 'Fault',
    edgeStyle: 'dashed',
  },
};
