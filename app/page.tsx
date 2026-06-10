'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { topologyNodeInputs, topologyEdges } from '@/data/mockTopology';
import type { TopologyNode, TopologyEdge, Status, EdgeType } from '@/types/topology';
import { BUILDINGS } from '@/data/buildings';
import { TopBar, ALPHA_PRESETS } from '@/components/layout/TopBar';
import { DetailDrawer } from '@/components/detail/DetailDrawer';
import { Toast } from '@/components/ui/Toast';
import { getCascadeTargets } from '@/lib/troubleshooting';
import { prepareMapTopology, getUsedEdgeTypes } from '@/lib/topologyFilters';
import type { BuildingFilter, DepthTier } from '@/lib/topologyFilters';
import { computeDerivedStatuses } from '@/lib/faultCascade';
import { assignParallelIndices } from '@/lib/parallelEdges';
import { useElementHistory } from '@/lib/useElementHistory';
// computeBuildingCols is called inside prepareMapTopology via layoutNodes;
// no longer needed at module level.

const TopologyMap = dynamic(
  () => import('@/components/topology/TopologyMap').then((m) => m.TopologyMap),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: '#34d399', borderTopColor: 'transparent' }}
        />
        <span
          className="text-sm text-slate-500 tracking-wider"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Loading topology...
        </span>
      </div>
    </div>
  );
}

/** All edge types that appear in the dataset — used to populate the cable filter */
const ALL_EDGE_TYPES = getUsedEdgeTypes(topologyEdges);

// Building column widths are now computed per-tier inside prepareMapTopology
// so each tier gets tightly-fitted columns (tree-based centering).
// No module-level BUILDING_COLS constant needed.

export default function Dashboard() {
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, Status>>({});
  const [edgeStatuses, setEdgeStatuses] = useState<Record<string, Status>>({});
  const [selected, setSelected] = useState<{
    data: TopologyNode | TopologyEdge;
    type: 'node' | 'edge';
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [buildingFilter, setBuildingFilter] = useState<BuildingFilter>('all');
  const [activeTier, setActiveTier] = useState<DepthTier>(1);
  const [visibleEdgeTypes, setVisibleEdgeTypes] = useState<Set<EdgeType>>(
    new Set(ALL_EDGE_TYPES)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState(false);
  const history = useElementHistory();

  // Press L to toggle Layout Mode (dev helper — does not ship as a visible UI element)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === 'l' || e.key === 'L') &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setLayoutMode((prev) => {
          const next = !prev;
          console.info(
            next
              ? '%c[Layout Mode ON]  Drag any node, then copy the positionOverride from the console.'
              : '%c[Layout Mode OFF]',
            'color: #fbbf24; font-weight: bold;'
          );
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // All nodes/edges with status overrides applied (catalog = full set, no layout)
  const catalogNodes = useMemo(
    () =>
      topologyNodeInputs.map((n) => ({
        ...n,
        status: nodeStatuses[n.id] ?? n.status,
      })),
    [nodeStatuses]
  );

  const catalogEdges = useMemo(
    () =>
      topologyEdges.map((e) => ({
        ...e,
        status: edgeStatuses[e.id] ?? e.status,
      })),
    [edgeStatuses]
  );

  // Positioned, filtered nodes/edges + per-tier column layout for the current view
  const {
    nodes: visibleNodes,
    edges: visibleEdges,
    buildingCols: currentBuildingCols,
  } = useMemo(
    () =>
      prepareMapTopology(
        topologyNodeInputs, topologyEdges,
        buildingFilter, activeTier, visibleEdgeTypes,
        { nodes: nodeStatuses, edges: edgeStatuses }
        // No pre-computed buildingCols: prepareMapTopology derives tight per-tier
        // tree-centred columns from visible nodes automatically.
      ),
    [buildingFilter, activeTier, visibleEdgeTypes, nodeStatuses, edgeStatuses]
  );

  // Parallel-lane metadata injected once per topology change, before React Flow
  // receives the edges.  Each edge gets parallelIndex / totalParallel /
  // parallelBothEnds so PowerCableEdge can laterally offset co-linear cables.
  const indexedEdges = useMemo(
    () => assignParallelIndices(visibleEdges, visibleNodes),
    [visibleEdges, visibleNodes]
  );

  // Fault cascade — derived statuses computed at render time, never stored
  const derivedStatuses = useMemo(
    () => computeDerivedStatuses(visibleNodes, indexedEdges),
    [visibleNodes, indexedEdges]
  );

  // KPI counts across the full catalog (not just visible)
  const kpiStats = useMemo(() => {
    const all = [...catalogNodes, ...catalogEdges] as { status: Status }[];
    return {
      total: all.length,
      operational: all.filter((x) => x.status === 'operational').length,
      investigation: all.filter((x) => x.status === 'investigation').length,
      fault: all.filter((x) => x.status === 'fault').length,
    };
  }, [catalogNodes, catalogEdges]);

  const faultNodes = useMemo(
    () =>
      catalogNodes
        .filter((n) => n.status === 'fault')
        .map((n) => ({ ...n, position: { x: 0, y: 0 } }) as TopologyNode),
    [catalogNodes]
  );

  // Resolve the selected element with current status + position
  const selectedWithStatus = useMemo(() => {
    if (!selected) return null;
    if (selected.type === 'node') {
      const input = catalogNodes.find((n) => n.id === selected.data.id);
      const laid = visibleNodes.find((n) => n.id === selected.data.id);
      if (!input) return null;
      return {
        data: { ...input, position: laid?.position ?? { x: 0, y: 0 } } as TopologyNode,
        type: 'node' as const,
      };
    }
    const e = catalogEdges.find((e) => e.id === selected.data.id);
    return e ? { data: e, type: 'edge' as const } : null;
  }, [selected, catalogNodes, catalogEdges, visibleNodes]);

  const handleNodeSelect = useCallback((node: TopologyNode) => {
    setSelected({ data: node, type: 'node' });
  }, []);

  const handleEdgeSelect = useCallback((edge: TopologyEdge) => {
    setSelected({ data: edge, type: 'edge' });
  }, []);

  const handleClose = useCallback(() => setSelected(null), []);

  const handleFaultNodeClick = useCallback(
    (nodeId: string) => {
      const input = catalogNodes.find((n) => n.id === nodeId);
      if (input) {
        setSelected({
          data: { ...input, position: { x: 0, y: 0 } } as TopologyNode,
          type: 'node',
        });
      }
    },
    [catalogNodes]
  );

  const handleStatusChange = useCallback(
    (id: string, type: 'node' | 'edge', newStatus: Status) => {
      // Derive the current status before overwriting so the history entry is accurate
      const prevStatus: Status =
        type === 'node'
          ? (nodeStatuses[id] ?? (topologyNodeInputs.find((n) => n.id === id)?.status ?? 'operational'))
          : (edgeStatuses[id] ?? (topologyEdges.find((e) => e.id === id)?.status ?? 'operational'));
      if (type === 'node') setNodeStatuses((p) => ({ ...p, [id]: newStatus }));
      else setEdgeStatuses((p) => ({ ...p, [id]: newStatus }));
      history.addStatusChange(id, prevStatus, newStatus);
    },
    [nodeStatuses, edgeStatuses, history]
  );

  const handleMarkResolved = useCallback(
    (id: string, type: 'node' | 'edge') => {
      if (type === 'node') {
        setNodeStatuses((prev) => {
          const next: Record<string, Status> = { ...prev, [id]: 'operational' };
          getCascadeTargets(id).nodes.forEach((nid) => { next[nid] = 'operational'; });
          return next;
        });
        const { edges: cascadeEdges } = getCascadeTargets(id);
        if (cascadeEdges.length) {
          setEdgeStatuses((prev) => {
            const next = { ...prev };
            cascadeEdges.forEach((eid) => { next[eid] = 'operational'; });
            return next;
          });
        }
      } else {
        setEdgeStatuses((p) => ({ ...p, [id]: 'operational' }));
      }
    },
    []
  );

  const handleToggleEdgeType = useCallback((type: EdgeType) => {
    setVisibleEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        // Don't allow hiding all types
        if (next.size <= 1) return prev;
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const handleInjectPreset = useCallback(
    (nodeIds: string[]) => {
      const blocked = nodeIds.filter((id) => {
        const node = topologyNodeInputs.find((n) => n.id === id);
        if (!node) return false;
        if (node.allowFaultInjection === false) return true;
        const building = BUILDINGS[node.physicalLocation.building];
        return building?.allowFaultInjection === false;
      });
      if (blocked.length > 0) {
        showToast(`Fault injection blocked on external asset: ${blocked.join(', ')}`);
        return;
      }
      setNodeStatuses((prev) => {
        const next = { ...prev };
        nodeIds.forEach((id) => { next[id] = 'fault'; });
        return next;
      });
      const preset = ALPHA_PRESETS.find((p) => p.nodeIds.some((id) => nodeIds.includes(id)));
      showToast(`Fault injected: ${preset?.label ?? nodeIds.join(', ')} — cascade propagating…`);
    },
    [showToast]
  );

  const handleResetAll = useCallback(() => {
    setNodeStatuses({});
    setEdgeStatuses({});
    showToast('All injected faults cleared — system reset to operational');
  }, [showToast]);

  const handleSimulateFault = useCallback(
    (id: string, type: 'node' | 'edge') => {
      if (type === 'node') {
        const node = topologyNodeInputs.find((n) => n.id === id);
        if (node?.allowFaultInjection === false) {
          showToast(`Fault injection blocked — ${node.name} is an external asset`);
          return;
        }
        const building = node ? BUILDINGS[node.physicalLocation.building] : undefined;
        if (building?.allowFaultInjection === false) {
          showToast(`Fault injection blocked — ${building.label} is outside site control`);
          return;
        }
      } else {
        const edge = topologyEdges.find((e) => e.id === id);
        if (edge?.route?.fromBuilding === 'substation') {
          showToast('Fault injection blocked — external grid supply cables are read-only');
          return;
        }
      }
      if (type === 'node') setNodeStatuses((p) => ({ ...p, [id]: 'fault' }));
      else setEdgeStatuses((p) => ({ ...p, [id]: 'fault' }));
      showToast(`Fault injected on ${id} — downstream cascade active`);
    },
    [showToast]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        faultNodes={faultNodes}
        buildingFilter={buildingFilter}
        onBuildingChange={setBuildingFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onFaultNodeClick={handleFaultNodeClick}
        kpiStats={kpiStats}
        activeTier={activeTier}
        onTierChange={setActiveTier}
        visibleEdgeTypes={visibleEdgeTypes}
        usedEdgeTypes={ALL_EDGE_TYPES}
        onToggleEdgeType={handleToggleEdgeType}
        onInjectPreset={handleInjectPreset}
        onResetAll={handleResetAll}
        hasInjections={Object.keys(nodeStatuses).length > 0 || Object.keys(edgeStatuses).length > 0}
      />

      <div className="flex-1 relative overflow-hidden min-h-0">
        <TopologyMap
          nodes={visibleNodes}
          edges={indexedEdges}
          selectedId={selectedWithStatus?.data.id ?? null}
          buildingFilter={buildingFilter}
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
          statusFilter={statusFilter}
          derivedStatuses={derivedStatuses}
          buildingCols={currentBuildingCols}
          layoutMode={layoutMode}
        />

        <DetailDrawer
          element={selectedWithStatus?.data ?? null}
          elementType={selectedWithStatus?.type ?? null}
          onClose={handleClose}
          onStatusChange={handleStatusChange}
          onMarkResolved={handleMarkResolved}
          onIntegrationAction={showToast}
          onSimulateFault={handleSimulateFault}
          history={history}
        />
      </div>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
