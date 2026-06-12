'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TopologyNode, TopologyEdge, Status, DocEntry, DocType } from '@/types/topology';
import { isTopologyEdge } from '@/types/topology';
import { BUILDINGS } from '@/data/buildings';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { ASSET_CONFIG, SPEC_LABELS, ZONE_CONFIG } from '@/lib/zoneConfig';
import { getCascadeTargets } from '@/lib/troubleshooting';
import { PLC_ITEM_GROUPS, type TerminalBoxDetail } from '@/types/terminalBox';
import type { ElementHistoryApi } from '@/lib/useElementHistory';
import type { ChangeLogEntry } from '@/types/history';

interface DetailDrawerProps {
  element: TopologyNode | TopologyEdge | null;
  elementType: 'node' | 'edge' | null;
  onClose: () => void;
  onStatusChange: (id: string, type: 'node' | 'edge', newStatus: Status) => void;
  onMarkResolved: (id: string, type: 'node' | 'edge') => void;
  onIntegrationAction: (message: string) => void;
  /** Inject this element as a fault for alpha scenario rehearsal */
  onSimulateFault: (id: string, type: 'node' | 'edge') => void;
  /** History API for displaying and writing change-log entries */
  history: ElementHistoryApi;
}

const STATUS_ACTIONS: { status: Status; label: string }[] = [
  { status: 'operational', label: 'Mark as operational' },
  { status: 'investigation', label: 'Under investigation' },
  { status: 'fault', label: 'Report fault' },
];

const INTEGRATION_TOAST = 'Alpha — live integration planned';

export function DetailDrawer({
  element,
  elementType,
  onClose,
  onStatusChange,
  onMarkResolved,
  onIntegrationAction,
  onSimulateFault,
  history,
}: DetailDrawerProps) {
  const [checkedStepsByElement, setCheckedStepsByElement] = useState<
    Record<string, string[]>
  >({});
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Operator');

  const faultInjectionBlocked =
    element && elementType === 'node' && 'physicalLocation' in element
      ? element.allowFaultInjection === false
        || BUILDINGS[element.physicalLocation.building]?.allowFaultInjection === false
      : element && elementType === 'edge' && 'route' in element
        ? element.route?.fromBuilding === 'substation'
        : false;
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const checkedSteps = new Set(
    element ? checkedStepsByElement[element.id] ?? [] : []
  );

  const toggleStep = (stepId: string) => {
    if (!element) return;
    setCheckedStepsByElement((prev) => {
      const current = new Set(prev[element.id] ?? []);
      if (current.has(stepId)) current.delete(stepId);
      else current.add(stepId);
      return { ...prev, [element.id]: [...current] };
    });
  };

  const isEdge = element ? isTopologyEdge(element) : false;
  const cfg = element ? STATUS_CONFIG[element.status] : null;
  const steps = element?.troubleshootingSteps || [];
  const stepCount = steps.length;
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
              background: '#ffffff',
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
                          color: '#94a3b8',
                          border: '1px solid rgba(0,0,0,0.06)',
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

                    <div className="text-sm font-medium text-slate-700">{element.name}</div>

                    {isEdge && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#94a3b8' }}>
                          {(element as TopologyEdge).source}
                        </span>
                        <svg width="16" height="8" viewBox="0 0 16 8">
                          <line x1="0" y1="4" x2="12" y2="4" stroke="#475569" strokeWidth="1.5" />
                          <path d="M10 1 L13 4 L10 7" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#94a3b8' }}>
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
                      border: '1px solid rgba(0,0,0,0.08)',
                      color: '#94a3b8',
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
              {/* ── Alpha scenario controls ── */}
              {!faultInjectionBlocked && (
              <div
                className="mx-4 md:mx-5 mt-4 rounded-lg overflow-hidden"
                style={{
                  border: '1px solid rgba(251,191,36,0.2)',
                  background: 'rgba(251,191,36,0.04)',
                }}
              >
                <div className="px-3 py-1.5 flex items-center gap-1.5" style={{ borderBottom: '1px solid rgba(251,191,36,0.12)' }}>
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#fbbf24" />
                  </svg>
                  <span className="text-[8px] font-bold tracking-widest uppercase text-amber-500/70">
                    Alpha Controls
                  </span>
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => onSimulateFault(element.id, elementType!)}
                    disabled={element.status === 'fault'}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 min-h-[44px] rounded-md text-[10px] font-bold tracking-wider uppercase transition-all duration-150"
                    style={{
                      background: element.status === 'fault'
                        ? 'rgba(248,113,113,0.06)'
                        : 'rgba(248,113,113,0.12)',
                      border: element.status === 'fault'
                        ? '1px solid rgba(248,113,113,0.15)'
                        : '1px solid rgba(248,113,113,0.4)',
                      color: element.status === 'fault' ? 'rgba(248,113,113,0.4)' : '#f87171',
                      cursor: element.status === 'fault' ? 'not-allowed' : 'pointer',
                      boxShadow: element.status === 'fault' ? 'none' : '0 0 12px rgba(248,113,113,0.15)',
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="17" r="0.8" fill="currentColor" />
                    </svg>
                    {element.status === 'fault' ? 'Fault active' : 'Inject Fault'}
                  </button>
                  <button
                    onClick={() => onStatusChange(element.id, elementType!, 'operational')}
                    disabled={element.status === 'operational'}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 min-h-[44px] rounded-md text-[10px] font-bold tracking-wider uppercase transition-all duration-150"
                    style={{
                      background: element.status === 'operational'
                        ? 'rgba(52,211,153,0.06)'
                        : 'rgba(52,211,153,0.12)',
                      border: element.status === 'operational'
                        ? '1px solid rgba(52,211,153,0.15)'
                        : '1px solid rgba(52,211,153,0.4)',
                      color: element.status === 'operational' ? 'rgba(52,211,153,0.4)' : '#34d399',
                      cursor: element.status === 'operational' ? 'not-allowed' : 'pointer',
                      boxShadow: element.status === 'operational' ? 'none' : '0 0 12px rgba(52,211,153,0.15)',
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {element.status === 'operational' ? 'All clear' : 'Clear Status'}
                  </button>
                </div>
              </div>
              )}
              {faultInjectionBlocked && (
                <div
                  className="mx-4 md:mx-5 mt-4 px-3 py-2.5 rounded-lg text-[10px] text-slate-400"
                  style={{
                    border: '1px solid rgba(148,163,184,0.15)',
                    background: 'rgba(148,163,184,0.04)',
                  }}
                >
                  External asset — fault simulation disabled (Fluvius grid interface).
                </div>
              )}

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

              {!isEdge && (
                <Section title="Physical location" icon="◎">
                  {(() => {
                    const loc = (element as TopologyNode).physicalLocation;
                    const zoneCfg = ZONE_CONFIG[loc.zone];
                    return (
                      <>
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full mb-3"
                          style={{
                            background: zoneCfg.bgColor,
                            border: `1px solid ${zoneCfg.borderColor}`,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-sm"
                            style={{ background: zoneCfg.color }}
                          />
                          <span className="text-[10px] font-semibold" style={{ color: zoneCfg.color }}>
                            {zoneCfg.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <SpecRow label="Building" value={BUILDINGS[loc.building].label} />
                          <SpecRow label="Floor" value={loc.floor} />
                          <SpecRow label="Elevation" value={loc.elevation} />
                          <SpecRow label="Area / Zone" value={loc.area} />
                          {loc.gridRef && (
                            <SpecRow label="Grid reference" value={loc.gridRef} />
                          )}
                        </div>
                      </>
                    );
                  })()}
                </Section>
              )}

              {!isEdge && (element as TopologyNode).terminalBox && (
                <TerminalBoxSection detail={(element as TopologyNode).terminalBox!} />
              )}

              {isEdge && (element as TopologyEdge).route?.spansBuildings && (
                <Section title="Cross-building route" icon="↔">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <SpecRow
                      label="From"
                      value={
                        (element as TopologyEdge).route?.fromBuilding
                          ? BUILDINGS[(element as TopologyEdge).route!.fromBuilding!].label
                          : '—'
                      }
                    />
                    <SpecRow
                      label="To"
                      value={
                        (element as TopologyEdge).route?.toBuilding
                          ? BUILDINGS[(element as TopologyEdge).route!.toBuilding!].label
                          : '—'
                      }
                    />
                    {(element as TopologyEdge).specs.installationType && (
                      <SpecRow
                        label="Installation"
                        value={(element as TopologyEdge).specs.installationType!}
                      />
                    )}
                  </div>
                </Section>
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
                {steps.length === 0 ? (
                  <div className="text-slate-500 italic text-[11px] py-1">No predefined troubleshooting steps.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {steps.map((step, idx) => {
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

                {steps.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Diagnostic progress</span>
                      <span style={{ fontFamily: 'var(--font-jetbrains-mono)', color: '#34d399' }}>
                        {checkedSteps.size}/{steps.length}
                      </span>
                    </div>
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(checkedSteps.size / steps.length) * 100}%`,
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

              {/* ── Documents & History ── */}
              <DocsAndHistory
                element={element}
                history={history}
                noteText={noteText}
                noteAuthor={noteAuthor}
                showNoteForm={showNoteForm}
                expandedDocId={expandedDocId}
                onNoteTextChange={setNoteText}
                onNoteAuthorChange={setNoteAuthor}
                onToggleNoteForm={() => { setShowNoteForm((v) => !v); setNoteText(''); }}
                onSaveNote={() => {
                  if (noteText.trim()) {
                    history.addNote(element.id, noteText.trim(), noteAuthor.trim() || 'Operator');
                    setNoteText('');
                    setShowNoteForm(false);
                  }
                }}
                onToggleDoc={(id) => setExpandedDocId((prev) => (prev === id ? null : id))}
              />

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


          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TerminalBoxSection({ detail }: { detail: TerminalBoxDetail }) {
  const { summary, items } = detail;
  const plcItems = items.filter((i) => PLC_ITEM_GROUPS.includes(i.itemGroup));

  return (
    <Section title="Terminal box inventory (imported)" icon="⬡">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {Object.entries(summary.byGroup).map(([group, count]) => (
          <div
            key={group}
            className="px-2 py-1.5 rounded text-[10px]"
            style={{
              background: PLC_ITEM_GROUPS.includes(group as typeof PLC_ITEM_GROUPS[number])
                ? 'rgba(56, 189, 248, 0.06)'
                : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span className="font-bold uppercase text-slate-500">{group}</span>
            <span className="ml-2 font-mono text-slate-700">{count}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-500 mb-2">
        {summary.powerItemCount} power-layer · {summary.plcItemCount} PLC-layer (signal map — coming soon)
      </p>

      {summary.drawingReferences.length > 0 && (
        <p className="text-[10px] text-slate-400 mb-3">
          Drawings: {summary.drawingReferences.join(', ')}
        </p>
      )}

      {plcItems.length > 0 && (
        <div
          className="rounded-lg p-2.5 max-h-32 overflow-y-auto"
          style={{
            background: 'rgba(56, 189, 248, 0.04)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          <div className="text-[9px] font-bold tracking-widest uppercase text-sky-400 mb-1.5">
            PLC terminals (stored, not on power map)
          </div>
          {plcItems.slice(0, 8).map((item) => (
            <div key={item.title} className="text-[10px] text-slate-500 font-mono truncate">
              {item.itemId} · {item.equipmentClass}
            </div>
          ))}
          {plcItems.length > 8 && (
            <div className="text-[9px] text-slate-600 mt-1">+{plcItems.length - 8} more</div>
          )}
        </div>
      )}
    </Section>
  );
}

// ─── Document type metadata ───────────────────────────────────────────────────

const DOC_TYPE_META: Record<DocType, { icon: string; label: string; color: string }> = {
  drawing:       { icon: '⬚', label: 'Drawing',       color: '#38bdf8' },
  protocol:      { icon: '✓', label: 'Protocol',      color: '#34d399' },
  commissioning: { icon: '⚡', label: 'Commissioning', color: '#a78bfa' },
  'fault-report':{ icon: '⚠', label: 'Fault report',  color: '#f87171' },
  datasheet:     { icon: '≡', label: 'Datasheet',     color: '#64748b' },
  note:          { icon: '✎', label: 'Note',          color: '#fbbf24' },
};

// ─── DocsAndHistory section ───────────────────────────────────────────────────

interface DocsAndHistoryProps {
  element: TopologyNode | TopologyEdge;
  history: ElementHistoryApi;
  noteText: string;
  noteAuthor: string;
  showNoteForm: boolean;
  expandedDocId: string | null;
  onNoteTextChange: (v: string) => void;
  onNoteAuthorChange: (v: string) => void;
  onToggleNoteForm: () => void;
  onSaveNote: () => void;
  onToggleDoc: (id: string) => void;
}

function DocsAndHistory({
  element,
  history,
  noteText,
  noteAuthor,
  showNoteForm,
  expandedDocId,
  onNoteTextChange,
  onNoteAuthorChange,
  onToggleNoteForm,
  onSaveNote,
  onToggleDoc,
}: DocsAndHistoryProps) {
  const docs = (element as TopologyNode).docs ?? [];
  const log = history.getHistory(element.id);
  const hasContent = docs.length > 0 || log.length > 0;

  return (
    <Section title="Documents & history" icon="📋">
      {/* Pre-loaded document cards */}
      {docs.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {docs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              expanded={expandedDocId === doc.id}
              onToggle={() => onToggleDoc(doc.id)}
            />
          ))}
        </div>
      )}

      {/* Change-log timeline */}
      {log.length > 0 && (
        <div className="flex flex-col gap-0 mb-4 relative">
          <div
            className="absolute left-[7px] top-3 bottom-3 w-px"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
          {log.map((entry) => (
            <HistoryEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {!hasContent && !showNoteForm && (
        <p className="text-xs text-slate-500 italic mb-3">No documents or history yet.</p>
      )}

      {/* Add note form */}
      {showNoteForm ? (
        <div
          className="rounded-lg p-3 mt-1"
          style={{
            background: 'rgba(251,191,36,0.05)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          <textarea
            value={noteText}
            onChange={(e) => onNoteTextChange(e.target.value)}
            placeholder="Type your note…"
            rows={3}
            className="w-full text-xs text-slate-800 resize-none rounded-md px-2.5 py-2 mb-2 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
              fontFamily: 'inherit',
            }}
          />
          <input
            value={noteAuthor}
            onChange={(e) => onNoteAuthorChange(e.target.value)}
            placeholder="Your name"
            className="w-full text-xs text-slate-700 rounded-md px-2.5 py-1.5 mb-2 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={onSaveNote}
              disabled={!noteText.trim()}
              className="flex-1 min-h-[36px] rounded-md text-xs font-bold transition-all"
              style={{
                background: noteText.trim() ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)',
                border: noteText.trim() ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(0,0,0,0.06)',
                color: noteText.trim() ? '#fbbf24' : '#475569',
                cursor: noteText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Save note
            </button>
            <button
              onClick={onToggleNoteForm}
              className="px-4 min-h-[36px] rounded-md text-xs text-slate-500 transition-colors"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onToggleNoteForm}
          className="w-full min-h-[40px] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-1"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(0,0,0,0.07)',
            color: '#94a3b8',
          }}
        >
          <span style={{ fontSize: 14 }}>+</span>
          Add note
        </button>
      )}
    </Section>
  );
}

function DocumentCard({
  doc,
  expanded,
  onToggle,
}: {
  doc: DocEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = DOC_TYPE_META[doc.type];
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(0,0,0,0.07)`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span
          className="flex items-center justify-center w-6 h-6 rounded shrink-0 text-[11px]"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-800 truncate">{doc.title}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: meta.color }}>
              {meta.label}
            </span>
            {doc.revision && (
              <span
                className="text-[9px] px-1 rounded"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {doc.revision}
              </span>
            )}
            <span className="text-[9px] text-slate-600">{doc.date}</span>
            <span className="text-[9px] text-slate-600 truncate">· {doc.author}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide transition-colors"
              style={{
                background: `${meta.color}18`,
                border: `1px solid ${meta.color}40`,
                color: meta.color,
              }}
            >
              PDF ↗
            </a>
          )}
          {doc.content && (
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-6 h-6 rounded text-slate-500 transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,0,0,0.07)',
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expandable content */}
      {doc.content && expanded && (
        <div
          className="px-3 pb-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap"
          style={{
            borderTop: '1px solid rgba(0,0,0,0.05)',
            paddingTop: 10,
          }}
        >
          {doc.content}
        </div>
      )}
    </div>
  );
}

function HistoryEntryRow({ entry }: { entry: ChangeLogEntry }) {
  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleDateString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex gap-3 pb-3 relative pl-5">
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: entry.type === 'status-change' ? 'rgba(99,102,241,0.25)' : 'rgba(251,191,36,0.2)',
          border: `1px solid ${entry.type === 'status-change' ? 'rgba(99,102,241,0.5)' : 'rgba(251,191,36,0.4)'}`,
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 7, color: entry.type === 'status-change' ? '#818cf8' : '#fbbf24' }}>
          {entry.type === 'status-change' ? '⇄' : '✎'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-[9px] font-semibold text-slate-400">{entry.author}</span>
          <span className="text-[9px] text-slate-600">{dateStr} {timeStr}</span>
        </div>

        {entry.type === 'status-change' && entry.fromStatus && entry.toStatus && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusChip status={entry.fromStatus} />
            <span style={{ color: '#64748b', fontSize: 9 }}>→</span>
            <StatusChip status={entry.toStatus} />
          </div>
        )}

        {entry.type === 'note-added' && entry.note && (
          <p
            className="text-[11px] leading-relaxed mt-0.5"
            style={{
              color: '#64748b',
              borderLeft: '2px solid rgba(251,191,36,0.3)',
              paddingLeft: 8,
            }}
          >
            {entry.note}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{
        background: cfg.bgColor,
        color: cfg.color,
        border: `1px solid ${cfg.borderColor}`,
      }}
    >
      {cfg.label}
    </span>
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
    <div className="px-4 md:px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
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
        className="text-xs font-medium text-slate-800 truncate"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {value}
      </div>
    </div>
  );
}
