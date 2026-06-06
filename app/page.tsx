'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { topologyNodeInputs, topologyEdges } from '@/data/mockTopology';
import type { TopologyNode, TopologyEdge, Status, EdgeType } from '@/types/topology';
import { TopBar } from '@/components/layout/TopBar';
import { DetailDrawer } from '@/components/detail/DetailDrawer';
import { Toast } from '@/components/ui/Toast';
import { getCascadeTargets } from '@/lib/troubleshooting';
import { prepareMapTopology, getUsedEdgeTypes } from '@/lib/topologyFilters';
import type { BuildingFilter, DepthTier } from '@/lib/topologyFilters';
import { computeDerivedStatuses } from '@/lib/faultCascade';

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

  // Positioned, filtered nodes/edges for the current view
  const { nodes: visibleNodes, edges: visibleEdges } = useMemo(
    () =>
      prepareMapTopology(topologyNodeInputs, topologyEdges, buildingFilter, activeTier, visibleEdgeTypes, {
        nodes: nodeStatuses,
        edges: edgeStatuses,
      }),
    [buildingFilter, activeTier, visibleEdgeTypes, nodeStatuses, edgeStatuses]
  );

  // Fault cascade — derived statuses computed at render time, never stored
  const derivedStatuses = useMemo(
    () => computeDerivedStatuses(visibleNodes, visibleEdges),
    [visibleNodes, visibleEdges]
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
      if (type === 'node') setNodeStatuses((p) => ({ ...p, [id]: newStatus }));
      else setEdgeStatuses((p) => ({ ...p, [id]: newStatus }));
    },
    []
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
      />

      <div className="flex-1 relative overflow-hidden min-h-0">
        <TopologyMap
          nodes={visibleNodes}
          edges={visibleEdges}
          selectedId={selectedWithStatus?.data.id ?? null}
          buildingFilter={buildingFilter}
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
          statusFilter={statusFilter}
          derivedStatuses={derivedStatuses}
        />

        <DetailDrawer
          element={selectedWithStatus?.data ?? null}
          elementType={selectedWithStatus?.type ?? null}
          onClose={handleClose}
          onStatusChange={handleStatusChange}
          onMarkResolved={handleMarkResolved}
          onIntegrationAction={showToast}
        />
      </div>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
