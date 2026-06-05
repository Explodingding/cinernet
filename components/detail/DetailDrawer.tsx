'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import { isTopologyEdge } from '@/types/topology';
import { STATUS_CONFIG, ASSET_CONFIG, SPEC_LABELS } from '@/lib/statusConfig';
import { getCascadeTargets } from '@/lib/troubleshooting';

interface DetailDrawerProps {
  element: TopologyNode | TopologyEdge | null;
  elementType: 'node' | 'edge' | null;
  onClose: () => void;
  onStatusChange: (id: string, type: 'node' | 'edge', newStatus: Status) => void;
  onMarkResolved: (id: string, type: 'node' | 'edge') => void;
  onIntegrationAction: (message: string) => void;
}

const STATUS_ACTIONS: { status: Status; label: string }[] = [
  { status: 'operational', label: 'Mark as operational' },
  { status: 'investigation', label: 'Under investigation' },
  { status: 'fault', label: 'Report fault' },
];

const INTEGRATION_TOAST = 'Demo mode — integration planned';

export function DetailDrawer({
  element,
  elementType,
  onClose,
  onStatusChange,
  onMarkResolved,
  onIntegrationAction,
}: DetailDrawerProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCheckedSteps(new Set());
  }, [element?.id]);

  const toggleStep = (stepId: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const isEdge = element ? isTopologyEdge(element) : false;
  const cfg = element ? STATUS_CONFIG[element.status] : null;
  const stepCount = element?.troubleshootingSteps.length ?? 0;
  const allStepsChecked =
    stepCount > 0 && checkedSteps.size === stepCount;
  const canMarkResolved =
    element &&
    element.status !== 'operational' &&
    stepCount > 0 &&
    allStepsChecked;
  const cascadeTargets =
    element && elementType === 'node' ? getCascadeTargets(element.id) : null;

  return (
    <AnimatePresence>
      {element && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-20"
            style={{ background: 'rgba(0,0,0,0.15)' }}
            onClick={onClose}
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="absolute right-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden w-full max-w-md md:w-[420px]"
            style={{
              background: 'rgba(8, 13, 22, 0.97)',
              borderLeft: `1px solid ${cfg?.borderColor ?? '#334155'}`,
              boxShadow: `-4px 0 40px rgba(0,0,0,0.6), -1px 0 0 rgba(255,255,255,0.03)`,
              backdropFilter: 'blur(12px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ borderBottom: `1px solid ${cfg?.borderColor ?? '#334155'}` }}>
              <div
                style={{
                  height: 4,
                  background: `linear-gradient(90deg, ${cfg?.color ?? '#64748b'} 0%, ${cfg?.color ?? '#64748b'}22 100%)`,
                }}
              />

              <div className="px-4 md:px-5 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#64748b',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {isEdge
                          ? 'POWER CABLE'
                          : ASSET_CONFIG[(element as TopologyNode).assetType]?.label.toUpperCase()}
                      </span>

                      <span
                        className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                        style={{
                          background: cfg?.bgColor,
                          color: cfg?.color,
                          border: `1px solid ${cfg?.borderColor}`,
                        }}
                      >
                        {cfg?.label}
                      </span>
                    </div>

                    <div
                      className="text-xl font-bold mb-0.5"
                      style={{
                        fontFamily: 'var(--font-jetbrains-mono)',
                        color: cfg?.color,
                        textShadow: `0 0 16px ${cfg?.color}60`,
                      }}
                    >
                      {element.id}
                    </div>

                    <div className="text-sm font-medium text-slate-300">{element.name}</div>

                    {isEdge && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#64748b' }}>
                          {(element as TopologyEdge).source}
                        </span>
                        <svg width="16" height="8" viewBox="0 0 16 8">
                          <line x1="0" y1="4" x2="12" y2="4" stroke="#475569" strokeWidth="1.5" />
                          <path d="M10 1 L13 4 L10 7" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#64748b' }}>
                          {(element as TopologyEdge).target}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={onClose}
                    aria-label="Close panel"
                    className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg shrink-0 transition-colors active:bg-red-500/10"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#64748b',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {element.upstreamHint && element.status === 'fault' && (
                <div
                  className="mx-4 md:mx-5 mt-4 px-3 py-3 rounded-lg"
                  style={{
                    background: 'rgba(251, 191, 36, 0.08)',
                    border: '1px solid rgba(251, 191, 36, 0.35)',
                  }}
                >
                  <div className="text-[9px] font-bold tracking-widest uppercase text-amber-400 mb-1">
                    Upstream diagnosis
                  </div>
                  <p className="text-xs leading-relaxed text-amber-100/80">{element.upstreamHint}</p>
                </div>
              )}

              <Section title="Technical specification" icon="⊞">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(
                    isEdge ? (element as TopologyEdge).specs : (element as TopologyNode).specs
                  )
                    .filter(([, v]) => v)
                    .map(([key, value]) => (
                      <SpecRow key={key} label={SPEC_LABELS[key] ?? key} value={value!} />
                    ))}
                </div>
              </Section>

              <Section title="Diagnostic checklist" icon="✓">
                {element.troubleshootingSteps.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No diagnostic steps defined.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {element.troubleshootingSteps.map((step, idx) => {
                      const done = checkedSteps.has(step.id);
                      return (
                        <button
                          key={step.id}
                          onClick={() => toggleStep(step.id)}
                          className="flex items-start gap-3 p-3 min-h-[48px] rounded-lg text-left w-full transition-all duration-150 active:scale-[0.99]"
                          style={{
                            background: done
                              ? 'rgba(52, 211, 153, 0.06)'
                              : 'rgba(255,255,255,0.03)',
                            border: done
                              ? '1px solid rgba(52, 211, 153, 0.25)'
                              : '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div
                            className="flex items-center justify-center w-6 h-6 min-w-[24px] rounded-full shrink-0 text-[10px] font-bold mt-0.5"
                            style={{
                              background: done
                                ? 'rgba(52, 211, 153, 0.15)'
                                : 'rgba(255,255,255,0.06)',
                              border: done
                                ? '1px solid rgba(52, 211, 153, 0.5)'
                                : '1px solid rgba(255,255,255,0.08)',
                              color: done ? '#34d399' : '#64748b',
                              fontFamily: 'var(--font-jetbrains-mono)',
                            }}
                          >
                            {done ? (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <span
                            className="text-xs leading-relaxed"
                            style={{
                              color: done ? '#64748b' : '#cbd5e1',
                              textDecoration: done ? 'line-through' : 'none',
                            }}
                          >
                            {step.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {element.troubleshootingSteps.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Diagnostic progress</span>
                      <span style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#34d399' }}>
                        {checkedSteps.size}/{element.troubleshootingSteps.length}
                      </span>
                    </div>
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(checkedSteps.size / element.troubleshootingSteps.length) * 100}%`,
                          background: 'linear-gradient(90deg, #34d399, #10b981)',
                          boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {stepCount > 0 && element.status !== 'operational' && (
                  <button
                    disabled={!canMarkResolved}
                    onClick={() => onMarkResolved(element.id, elementType!)}
                    className="mt-4 w-full min-h-[48px] px-4 py-3 rounded-lg text-sm font-bold transition-all duration-150"
                    style={{
                      background: canMarkResolved
                        ? 'rgba(52, 211, 153, 0.15)'
                        : 'rgba(255,255,255,0.03)',
                      border: canMarkResolved
                        ? '1px solid rgba(52, 211, 153, 0.5)'
                        : '1px solid rgba(255,255,255,0.06)',
                      color: canMarkResolved ? '#34d399' : '#475569',
                      cursor: canMarkResolved ? 'pointer' : 'not-allowed',
                      boxShadow: canMarkResolved
                        ? '0 0 16px rgba(52, 211, 153, 0.2)'
                        : 'none',
                    }}
                  >
                    Mark as resolved
                  </button>
                )}

                {stepCount > 0 && element.status !== 'operational' && !allStepsChecked && (
                  <p className="mt-2 text-[10px] text-slate-500 text-center">
                    Complete all checklist steps to enable resolution
                  </p>
                )}

                {cascadeTargets &&
                  (cascadeTargets.nodes.length > 0 || cascadeTargets.edges.length > 0) && (
                    <p className="mt-2 text-[10px] text-slate-500 text-center">
                      Resolving {element.id} will also restore downstream assets
                    </p>
                  )}
              </Section>

              <Section title="Change status" icon="◎">
                <div className="flex flex-col gap-2">
                  {STATUS_ACTIONS.map((action) => {
                    const sCfg = STATUS_CONFIG[action.status];
                    const isCurrent = element.status === action.status;
                    return (
                      <button
                        key={action.status}
                        disabled={isCurrent}
                        onClick={() => onStatusChange(element.id, elementType!, action.status)}
                        className="flex items-center justify-between w-full px-3 py-3 min-h-[48px] rounded-lg text-sm font-medium transition-all duration-150"
                        style={{
                          background: isCurrent ? sCfg.bgColor : 'rgba(255,255,255,0.03)',
                          border: isCurrent
                            ? `1px solid ${sCfg.borderColor}`
                            : '1px solid rgba(255,255,255,0.06)',
                          color: isCurrent ? sCfg.color : '#64748b',
                          cursor: isCurrent ? 'default' : 'pointer',
                          opacity: isCurrent ? 1 : 0.85,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: sCfg.color }} />
                          {action.label}
                        </div>
                        {isCurrent && (
                          <span
                            className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                            style={{
                              background: sCfg.bgColor,
                              color: sCfg.color,
                              border: `1px solid ${sCfg.borderColor}`,
                            }}
                          >
                            Current
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Section>
            </div>

            <div
              className="px-4 md:px-5 py-4 shrink-0"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(10, 15, 26, 0.5)',
              }}
            >
              <div className="text-[9px] font-bold tracking-widest uppercase text-slate-600 mb-2">
                Integration layer
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onIntegrationAction(INTEGRATION_TOAST)}
                  className="flex-1 min-h-[48px] px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors active:bg-slate-700/50"
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }}
                >
                  Sync from SCADA
                </button>
                <button
                  onClick={() => onIntegrationAction(INTEGRATION_TOAST)}
                  className="flex-1 min-h-[48px] px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors active:bg-slate-700/50"
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }}
                >
                  Close in osapiens
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 md:px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] text-slate-600">{icon}</span>
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-400">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 mb-0.5">
        {label}
      </div>
      <div
        className="text-xs font-medium text-slate-200 truncate"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {value}
      </div>
    </div>
  );
}
