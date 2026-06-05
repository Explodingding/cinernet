'use client';

import type { Status } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';

type Filter = Status | 'all';

interface StatusFilterBarProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const filters: { id: Filter; label: string; color?: string }[] = [
  { id: 'all', label: 'Wszystkie', color: '#64748b' },
  { id: 'operational', label: STATUS_CONFIG.operational.labelPl, color: STATUS_CONFIG.operational.color },
  { id: 'investigation', label: STATUS_CONFIG.investigation.labelPl, color: STATUS_CONFIG.investigation.color },
  { id: 'fault', label: STATUS_CONFIG.fault.labelPl, color: STATUS_CONFIG.fault.color },
];

const comingSoon = [
  { label: 'Sygnały PLC', icon: '⬡' },
  { label: 'Linia SN', icon: '⚡' },
];

export function StatusFilterBar({ activeFilter, onFilterChange }: StatusFilterBarProps) {
  return (
    <div
      className="flex items-center gap-2 px-5 py-2 shrink-0"
      style={{
        background: 'rgba(10, 15, 26, 0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mr-1">
        Filtr:
      </span>

      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150"
            style={{
              background: isActive
                ? `rgba(${f.color ? hexToRgb(f.color) : '100,116,139'}, 0.15)`
                : 'rgba(30, 41, 59, 0.5)',
              border: isActive
                ? `1px solid ${f.color ?? '#64748b'}`
                : '1px solid rgba(255,255,255,0.06)',
              color: isActive ? (f.color ?? '#e2e8f0') : '#64748b',
              boxShadow: isActive
                ? `0 0 10px rgba(${f.color ? hexToRgb(f.color) : '100,116,139'}, 0.2)`
                : 'none',
            }}
          >
            {f.id !== 'all' && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: f.color ?? '#64748b' }}
              />
            )}
            {f.label}
          </button>
        );
      })}

      {/* Divider */}
      <div
        className="h-5 w-px mx-2 shrink-0"
        style={{ background: '#1e293b' }}
      />

      {/* Coming soon filters */}
      <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
        Wkrótce:
      </span>
      {comingSoon.map((f) => (
        <button
          key={f.label}
          disabled
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold opacity-30 cursor-not-allowed"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#475569',
          }}
        >
          <span className="text-[9px]">{f.icon}</span>
          {f.label}
        </button>
      ))}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
