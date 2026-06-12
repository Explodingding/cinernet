import type { TopologyNode } from '@/types/topology';

interface AlertBannerProps {
  faultNodes: TopologyNode[];
  onNodeClick: (nodeId: string) => void;
}

export function AlertBanner({ faultNodes, onNodeClick }: AlertBannerProps) {
  if (faultNodes.length === 0) return null;

  const primary = faultNodes[0];

  return (
    <div
      className="flex items-center gap-3 px-3 md:px-5 py-2 shrink-0 cursor-pointer group min-h-[44px]"
      style={{
        background:
          'linear-gradient(90deg, rgba(254,226,226,0.95) 0%, rgba(254,202,202,0.85) 50%, rgba(254,226,226,0.9) 100%)',
        borderBottom: '1px solid rgba(220,38,38,0.3)',
      }}
      onClick={() => onNodeClick(primary.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onNodeClick(primary.id);
      }}
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
        style={{
          background: 'rgba(248, 113, 113, 0.2)',
          border: '1px solid rgba(248, 113, 113, 0.5)',
          animation: 'alert-blink 2s ease-in-out infinite',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="#f87171"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span
          className="text-xs font-bold tracking-wider uppercase shrink-0"
          style={{ color: '#dc2626', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          ACTIVE FAULT
        </span>
        <span className="text-xs text-red-600/70 shrink-0">—</span>
        <span
          className="text-xs font-bold shrink-0"
          style={{ color: '#b91c1c', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          {primary.id}
        </span>
        <span className="text-xs text-red-700/60 truncate">{primary.name}</span>

        {faultNodes.length > 1 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: 'rgba(248, 113, 113, 0.2)',
              color: '#dc2626',
              border: '1px solid rgba(248, 113, 113, 0.3)',
            }}
          >
            +{faultNodes.length - 1} more
          </span>
        )}
      </div>

      <div
        className="flex items-center gap-1.5 text-xs font-semibold shrink-0"
        style={{ color: '#991b1b' }}
      >
        <span className="hidden sm:inline">Go to fault</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12h14M12 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
