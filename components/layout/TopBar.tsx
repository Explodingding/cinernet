'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { TopologyNode, Status, EdgeType } from '@/types/topology';
import type { BuildingFilter, DepthTier } from '@/lib/topologyFilters';
import { BUILDINGS, SITE_BUILDING_ORDER } from '@/data/buildings';
import { STATUS_CONFIG } from '@/lib/statusConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

type Panel = 'fault' | 'building' | 'status' | 'kpi' | 'cables' | null;

export interface KpiStats {
  total: number;
  operational: number;
  investigation: number;
  fault: number;
}

/** Human-readable labels and icons for each cable/edge type */
const EDGE_TYPE_META: Record<EdgeType, { label: string; shortLabel: string; color: string }> = {
  mv:       { label: 'Medium Voltage',  shortLabel: 'MV',       color: '#f97316' },
  power:    { label: 'LV Power',        shortLabel: 'Power',    color: '#34d399' },
  plc:      { label: 'Control (PLC)',   shortLabel: 'PLC',      color: '#60a5fa' },
  signal:   { label: 'Instrument',      shortLabel: 'Signal',   color: '#a78bfa' },
  fieldbus: { label: 'Fieldbus',        shortLabel: 'Fieldbus', color: '#f0abfc' },
  ethernet: { label: 'Network',         shortLabel: 'Network',  color: '#94a3b8' },
};

const TIER_META: Record<DepthTier, { label: string; sub: string }> = {
  1: { label: '400V focus', sub: 'MV supply + 400V chain' },
  2: { label: 'Distribution', sub: '+ MDPs & cabinets' },
  3: { label: 'All systems', sub: '+ 6kV, generators, circuits' },
};

interface TopBarProps {
  faultNodes: TopologyNode[];
  buildingFilter: BuildingFilter;
  onBuildingChange: (b: BuildingFilter) => void;
  statusFilter: Status | 'all';
  onStatusFilterChange: (s: Status | 'all') => void;
  onFaultNodeClick: (nodeId: string) => void;
  kpiStats: KpiStats;
  activeTier: DepthTier;
  onTierChange: (t: DepthTier) => void;
  visibleEdgeTypes: Set<EdgeType>;
  usedEdgeTypes: Set<EdgeType>;
  onToggleEdgeType: (t: EdgeType) => void;
}

// ─── Shared panel container style ─────────────────────────────────────────────

const PANEL: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  zIndex: 50,
  background: 'rgba(8, 13, 22, 0.97)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)',
  overflow: 'hidden',
  animation: 'panel-slide-down 0.14s ease-out',
};

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div
      className="h-5 w-px shrink-0"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    />
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function hexRgb(hex: string) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].join(',');
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar({
  faultNodes,
  buildingFilter,
  onBuildingChange,
  statusFilter,
  onStatusFilterChange,
  onFaultNodeClick,
  kpiStats,
  activeTier,
  onTierChange,
  visibleEdgeTypes,
  usedEdgeTypes,
  onToggleEdgeType,
}: TopBarProps) {
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [time, setTime] = useState('');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = useCallback(
    (panel: Panel) => setOpenPanel((prev) => (prev === panel ? null : panel)),
    []
  );

  const close = useCallback(() => setOpenPanel(null), []);

  const hasFaults = faultNodes.length > 0;
  const bldColor = buildingFilter === 'all' ? '#64748b' : BUILDINGS[buildingFilter].color;
  const bldLabel =
    buildingFilter === 'all' ? 'Full site' : BUILDINGS[buildingFilter].shortLabel;
  const stsColor = statusFilter === 'all' ? '#64748b' : STATUS_CONFIG[statusFilter].color;
  const stsLabel = statusFilter === 'all' ? 'All' : STATUS_CONFIG[statusFilter].label;

  return (
    <header
      ref={ref}
      className="relative flex items-center h-12 px-3 md:px-5 gap-2 shrink-0"
      style={{
        background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 100%)',
        borderBottom: '1px solid rgba(52, 211, 153, 0.2)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
        zIndex: 20,
      }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(52,211,153,0.06) 100%)',
            border: '1px solid rgba(52,211,153,0.4)',
            boxShadow: '0 0 10px rgba(52,211,153,0.15)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
              fill="#34d399"
              stroke="#34d399"
              strokeWidth="0.5"
            />
          </svg>
        </div>
        <div>
          <span
            className="text-[12px] font-bold tracking-[0.2em] uppercase"
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              color: '#34d399',
              textShadow: '0 0 10px rgba(52,211,153,0.35)',
            }}
          >
            CINERNET
          </span>
          <span className="hidden lg:inline text-[9px] text-slate-600 tracking-wider ml-2">
            Lommel Glass
          </span>
        </div>
      </div>

      <Divider />

      {/* ── Fault badge ── */}
      <div className="relative shrink-0">
        <button
          onClick={() => toggle('fault')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-150"
          style={{
            background: hasFaults
              ? openPanel === 'fault'
                ? 'rgba(248,113,113,0.22)'
                : 'rgba(248,113,113,0.1)'
              : 'rgba(52,211,153,0.07)',
            border: hasFaults
              ? '1px solid rgba(248,113,113,0.45)'
              : '1px solid rgba(52,211,153,0.2)',
            color: hasFaults ? '#f87171' : '#34d399',
          }}
        >
          {hasFaults ? (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full bg-red-400"
                style={{ animation: 'live-pulse 1.4s ease-in-out infinite' }}
              />
              {faultNodes.length} FAULT{faultNodes.length !== 1 ? 'S' : ''}
              {kpiStats.investigation > 0 && (
                <span className="text-yellow-400/70 font-semibold normal-case hidden sm:inline">
                  &nbsp;+{kpiStats.investigation}
                </span>
              )}
              <Chevron open={openPanel === 'fault'} />
            </>
          ) : (
            <>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              All clear
            </>
          )}
        </button>

        {openPanel === 'fault' && (
          <FaultPanel
            faultNodes={faultNodes}
            kpiStats={kpiStats}
            onNodeClick={(id) => {
              close();
              onFaultNodeClick(id);
            }}
          />
        )}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1 min-w-0" />

      {/* ── Depth tier selector ── */}
      <div
        className="flex items-center gap-px rounded-lg overflow-hidden shrink-0"
        style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.7)' }}
      >
        {([1, 2, 3] as DepthTier[]).map((tier) => {
          const isActive = activeTier === tier;
          return (
            <button
              key={tier}
              onClick={() => onTierChange(tier)}
              title={`${TIER_META[tier].label} — ${TIER_META[tier].sub}`}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-all duration-150"
              style={{
                background: isActive ? 'rgba(52,211,153,0.15)' : 'transparent',
                color: isActive ? '#34d399' : '#475569',
                borderRight: tier < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <span
                className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[7px] font-black"
                style={{
                  background: isActive ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.06)'}`,
                  color: isActive ? '#34d399' : '#475569',
                }}
              >
                {tier}
              </span>
              <span className="hidden md:inline">{TIER_META[tier].label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Cable type filter ── */}
      <div className="relative shrink-0">
        <button
          onClick={() => toggle('cables')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150"
          style={{
            background: openPanel === 'cables' ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.7)',
            border: `1px solid ${openPanel === 'cables' ? '#64748b' : 'rgba(255,255,255,0.08)'}`,
            color: openPanel === 'cables' ? '#94a3b8' : '#475569',
          }}
          title="Cable type visibility"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M5 6h14M5 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Cables</span>
          {visibleEdgeTypes.size < usedEdgeTypes.size && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"
              title="Some cable types hidden"
            />
          )}
          <Chevron open={openPanel === 'cables'} />
        </button>

        {openPanel === 'cables' && (
          <CableTypePanel
            usedEdgeTypes={usedEdgeTypes}
            visibleEdgeTypes={visibleEdgeTypes}
            onToggle={(t) => { onToggleEdgeType(t); }}
          />
        )}
      </div>

      {/* ── Building filter ── */}
      <div className="relative shrink-0">
        <button
          onClick={() => toggle('building')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150"
          style={{
            background:
              openPanel === 'building'
                ? `rgba(${hexRgb(bldColor)},0.15)`
                : 'rgba(15,23,42,0.7)',
            border: `1px solid ${openPanel === 'building' ? bldColor : 'rgba(255,255,255,0.08)'}`,
            color: openPanel === 'building' ? bldColor : '#64748b',
          }}
          title="Filter by building"
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: bldColor }}
          />
          <span className="hidden sm:inline">{bldLabel}</span>
          <Chevron open={openPanel === 'building'} />
        </button>

        {openPanel === 'building' && (
          <BuildingPanel
            active={buildingFilter}
            onChange={(b) => {
              onBuildingChange(b);
              close();
            }}
          />
        )}
      </div>

      {/* ── Status filter ── */}
      <div className="relative shrink-0">
        <button
          onClick={() => toggle('status')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150"
          style={{
            background:
              openPanel === 'status'
                ? `rgba(${hexRgb(stsColor)},0.12)`
                : 'rgba(15,23,42,0.7)',
            border: `1px solid ${openPanel === 'status' ? stsColor : 'rgba(255,255,255,0.08)'}`,
            color: openPanel === 'status' ? stsColor : '#64748b',
          }}
          title="Filter by status"
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: stsColor }}
          />
          <span className="hidden sm:inline">{stsLabel}</span>
          <Chevron open={openPanel === 'status'} />
        </button>

        {openPanel === 'status' && (
          <StatusPanel
            active={statusFilter}
            onChange={(s) => {
              onStatusFilterChange(s);
              close();
            }}
          />
        )}
      </div>

      {/* ── KPI stats ── */}
      <div className="relative shrink-0">
        <button
          onClick={() => toggle('kpi')}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
          style={{
            background: openPanel === 'kpi' ? 'rgba(100,116,139,0.18)' : 'rgba(15,23,42,0.7)',
            border: `1px solid ${openPanel === 'kpi' ? '#64748b' : 'rgba(255,255,255,0.07)'}`,
            color: openPanel === 'kpi' ? '#94a3b8' : '#475569',
          }}
          title="System statistics"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" />
            <rect x="10" y="7" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.8" />
            <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>

        {openPanel === 'kpi' && <KpiPanel stats={kpiStats} />}
      </div>

      <Divider />

      {/* ── Live badge ── */}
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-bold tracking-widest uppercase shrink-0"
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.28)',
          color: '#f87171',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"
          style={{ animation: 'live-pulse 1.5s ease-in-out infinite' }}
        />
        LIVE
      </div>

      {/* ── Clock ── */}
      <div
        className="text-sm font-bold tabular-nums shrink-0 hidden md:block"
        style={{
          fontFamily: 'var(--font-jetbrains-mono)',
          color: '#94a3b8',
          minWidth: 58,
        }}
      >
        {time}
      </div>
    </header>
  );
}

// ─── Dropdown panels ───────────────────────────────────────────────────────────

function FaultPanel({
  faultNodes,
  kpiStats,
  onNodeClick,
}: {
  faultNodes: TopologyNode[];
  kpiStats: KpiStats;
  onNodeClick: (id: string) => void;
}) {
  return (
    <div style={{ ...PANEL, left: 0, minWidth: 320, maxWidth: 420 }}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-white/[0.06]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="#f87171"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[9px] font-bold tracking-widest uppercase text-red-400 flex-1">
          Active faults — {faultNodes.length}
        </span>
        {kpiStats.investigation > 0 && (
          <span className="text-[9px] text-yellow-400/60">
            +{kpiStats.investigation} under investigation
          </span>
        )}
      </div>

      {faultNodes.length === 0 ? (
        <div className="px-4 py-5 text-center text-[11px] text-slate-600">
          No active faults
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          {faultNodes.map((node, i) => (
            <button
              key={node.id}
              onClick={() => onNodeClick(node.id)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors group"
              style={{
                borderBottom:
                  i < faultNodes.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: 'rgba(248,113,113,0.12)',
                  border: '1px solid rgba(248,113,113,0.35)',
                }}
              >
                <span className="text-[8px] font-bold text-red-400">!</span>
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[11px] font-bold leading-tight"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#fca5a5' }}
                >
                  {node.id}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{node.name}</div>
                <div className="text-[9px] text-slate-600 mt-0.5">
                  {node.physicalLocation.floor} · {node.physicalLocation.elevation}
                </div>
              </div>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0 mt-1 opacity-0 group-hover:opacity-50 transition-opacity"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BuildingPanel({
  active,
  onChange,
}: {
  active: BuildingFilter;
  onChange: (b: BuildingFilter) => void;
}) {
  const options: { id: BuildingFilter; label: string; color: string; sub: string }[] = [
    { id: 'all', label: 'Full site', color: '#64748b', sub: 'All three buildings' },
    ...SITE_BUILDING_ORDER.map((id) => ({
      id: id as BuildingFilter,
      label: BUILDINGS[id].label,
      color: BUILDINGS[id].color,
      sub: BUILDINGS[id].description,
    })),
  ];

  return (
    <div style={{ ...PANEL, right: 0, minWidth: 260 }}>
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">
          Building
        </span>
      </div>
      {options.map((opt) => {
        const isActive = active === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: isActive ? opt.color : 'rgba(100,116,139,0.3)',
                boxShadow: isActive ? `0 0 6px ${opt.color}80` : 'none',
              }}
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-semibold"
                style={{ color: isActive ? opt.color : '#64748b' }}
              >
                {opt.label}
              </div>
              <div className="text-[9px] text-slate-700 truncate">{opt.sub}</div>
            </div>
            {isActive && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke={opt.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

function StatusPanel({
  active,
  onChange,
}: {
  active: Status | 'all';
  onChange: (s: Status | 'all') => void;
}) {
  const options: { id: Status | 'all'; label: string; color: string }[] = [
    { id: 'all', label: 'All status', color: '#64748b' },
    { id: 'operational', label: STATUS_CONFIG.operational.label, color: STATUS_CONFIG.operational.color },
    { id: 'investigation', label: STATUS_CONFIG.investigation.label, color: STATUS_CONFIG.investigation.color },
    { id: 'fault', label: STATUS_CONFIG.fault.label, color: STATUS_CONFIG.fault.color },
  ];

  return (
    <div style={{ ...PANEL, right: 0, minWidth: 190 }}>
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">Status</span>
      </div>
      {options.map((opt) => {
        const isActive = active === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: isActive ? opt.color : 'rgba(100,116,139,0.3)' }}
            />
            <span
              className="text-[11px] font-semibold flex-1"
              style={{ color: isActive ? opt.color : '#64748b' }}
            >
              {opt.label}
            </span>
            {isActive && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke={opt.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

function KpiPanel({ stats }: { stats: KpiStats }) {
  const items = [
    { label: 'Total', value: stats.total, color: '#475569' },
    { label: 'Operational', value: stats.operational, color: '#34d399' },
    { label: 'Investigation', value: stats.investigation, color: '#fbbf24' },
    { label: 'Fault', value: stats.fault, color: '#f87171' },
  ];

  return (
    <div style={{ ...PANEL, right: 0, minWidth: 260 }}>
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">
          System overview
        </span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {items.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-0.5 px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: `1px solid rgba(${hexRgb(s.color)},0.12)`,
              borderLeft: `3px solid ${s.color}`,
            }}
          >
            <span
              className="text-xl font-bold tabular-nums leading-tight"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', color: s.color }}
            >
              {s.value}
            </span>
            <span className="text-[9px] text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CableTypePanel({
  usedEdgeTypes,
  visibleEdgeTypes,
  onToggle,
}: {
  usedEdgeTypes: Set<EdgeType>;
  visibleEdgeTypes: Set<EdgeType>;
  onToggle: (t: EdgeType) => void;
}) {
  const types = Array.from(usedEdgeTypes);
  return (
    <div style={{ ...PANEL, right: 0, minWidth: 220 }}>
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">
          Cable types
        </span>
      </div>
      {types.map((type) => {
        const meta = EDGE_TYPE_META[type];
        const isVisible = visibleEdgeTypes.has(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            <span
              className="w-2.5 h-1 rounded-full shrink-0"
              style={{ background: isVisible ? meta.color : 'rgba(100,116,139,0.2)' }}
            />
            <span
              className="text-[11px] font-semibold flex-1"
              style={{ color: isVisible ? meta.color : '#334155' }}
            >
              {meta.label}
            </span>
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{
                background: isVisible ? `rgba(${hexRgb(meta.color)},0.12)` : 'rgba(255,255,255,0.03)',
                color: isVisible ? meta.color : '#334155',
                border: `1px solid ${isVisible ? `rgba(${hexRgb(meta.color)},0.25)` : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              {meta.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
