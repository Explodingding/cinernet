import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';

interface KpiBarProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

interface KpiCardProps {
  label: string;
  value: number;
  accentColor: string;
  sublabel?: string;
}

function KpiCard({ label, value, accentColor, sublabel }: KpiCardProps) {
  return (
    <div
      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg flex-1 min-w-0"
      style={{
        background: '#ffffff',
        border: `1px solid #e2e8f0`,
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: `0 1px 4px rgba(0,0,0,0.07)`,
      }}
    >
      <div
        className="text-2xl md:text-3xl font-bold tabular-nums leading-none"
        style={{
          fontFamily: 'var(--font-jetbrains-mono)',
          color: accentColor,
          
        }}
      >
        {value}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] md:text-xs font-semibold text-slate-600 leading-tight truncate">
          {label}
        </div>
        {sublabel && (
          <div className="text-[9px] md:text-[10px] text-slate-400 mt-0.5 truncate">{sublabel}</div>
        )}
      </div>
    </div>
  );
}

export function KpiBar({ nodes, edges }: KpiBarProps) {
  const allElements = [...nodes, ...edges];
  const counts: Record<Status, number> = {
    operational: 0,
    investigation: 0,
    fault: 0,
  };
  allElements.forEach((e) => counts[e.status]++);

  return (
    <div
      className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 shrink-0 overflow-x-auto"
      style={{
        background: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <KpiCard
        label="All elements"
        value={allElements.length}
        accentColor="#64748b"
        sublabel={`${nodes.length} nodes / ${edges.length} cables`}
      />
      <KpiCard
        label="Operational"
        value={counts.operational}
        accentColor="#34d399"
        sublabel={STATUS_CONFIG.operational.label}
      />
      <KpiCard
        label="Investigation"
        value={counts.investigation}
        accentColor="#fbbf24"
        sublabel={STATUS_CONFIG.investigation.label}
      />
      <KpiCard
        label="Fault"
        value={counts.fault}
        accentColor="#f87171"
        sublabel="fault / no power"
      />

      <div
        className="h-8 md:h-10 w-px mx-1 shrink-0 hidden xl:block"
        style={{ background: 'linear-gradient(to bottom, transparent, #334155, transparent)' }}
      />

      <div className="hidden xl:flex items-center gap-4 text-[10px] text-slate-500 shrink-0">
        <div className="flex items-center gap-1.5">
          <svg width="24" height="8">
            <line x1="0" y1="4" x2="24" y2="4" stroke="#34d399" strokeWidth="2" />
            <circle cx="16" cy="4" r="3" fill="#34d399" />
          </svg>
          <span>Powered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="24" height="8">
            <line x1="0" y1="4" x2="24" y2="4" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span>Check</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="24" height="8">
            <line x1="0" y1="4" x2="24" y2="4" stroke="#f87171" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <span>Fault</span>
        </div>
      </div>
    </div>
  );
}
