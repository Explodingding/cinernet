'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { topologyNodes, topologyEdges } from '@/data/mockTopology';
import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import { isTopologyEdge } from '@/types/topology';
import { BrandHeader } from '@/components/layout/BrandHeader';
import { KpiBar } from '@/components/layout/KpiBar';
import { AlertBanner } from '@/components/layout/AlertBanner';
import { StatusFilterBar } from '@/components/topology/StatusFilterBar';
import { DetailDrawer } from '@/components/detail/DetailDrawer';

/* Dynamic import prevents SSR issues with React Flow */
const TopologyMap = dynamic(
  () => import('@/components/topology/TopologyMap').then((m) => m.TopologyMap),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#34d399', borderTopColor: 'transparent' }}
        />
        <span
          className="text-sm text-slate-500 tracking-wider"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Ładowanie topologii...
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  /* Status overrides (delta from mock data) */
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, Status>>({});
  const [edgeStatuses, setEdgeStatuses] = useState<Record<string, Status>>({});

  /* Selected element */
  const [selected, setSelected] = useState<{
    data: TopologyNode | TopologyEdge;
    type: 'node' | 'edge';
  } | null>(null);

  /* Status filter */
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  /* Merge status overrides into data */
  const effectiveNodes = useMemo(
    () =>
      topologyNodes.map((n) => ({
        ...n,
        status: nodeStatuses[n.id] ?? n.status,
      })),
    [nodeStatuses]
  );

  const effectiveEdges = useMemo(
    () =>
      topologyEdges.map((e) => ({
        ...e,
        status: edgeStatuses[e.id] ?? e.status,
      })),
    [edgeStatuses]
  );

  const faultNodes = useMemo(
    () => effectiveNodes.filter((n) => n.status === 'fault'),
    [effectiveNodes]
  );

  /* Selected element with effective status */
  const selectedWithStatus = useMemo(() => {
    if (!selected) return null;
    if (selected.type === 'node') {
      const n = effectiveNodes.find((n) => n.id === selected.data.id);
      return n ? { data: n, type: 'node' as const } : null;
    } else {
      const e = effectiveEdges.find((e) => e.id === selected.data.id);
      return e ? { data: e, type: 'edge' as const } : null;
    }
  }, [selected, effectiveNodes, effectiveEdges]);

  /* Callbacks */
  const handleNodeSelect = useCallback((node: TopologyNode) => {
    setSelected({ data: node, type: 'node' });
  }, []);

  const handleEdgeSelect = useCallback((edge: TopologyEdge) => {
    setSelected({ data: edge, type: 'edge' });
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const handleAlertClick = useCallback(
    (nodeId: string) => {
      const node = effectiveNodes.find((n) => n.id === nodeId);
      if (node) setSelected({ data: node, type: 'node' });
    },
    [effectiveNodes]
  );

  const handleStatusChange = useCallback(
    (id: string, type: 'node' | 'edge', newStatus: Status) => {
      if (type === 'node') {
        setNodeStatuses((prev) => ({ ...prev, [id]: newStatus }));
      } else {
        setEdgeStatuses((prev) => ({ ...prev, [id]: newStatus }));
      }
    },
    []
  );

  const selectedId = selectedWithStatus?.data.id ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top header ── */}
      <BrandHeader />

      {/* ── KPI metrics bar ── */}
      <KpiBar nodes={effectiveNodes} edges={effectiveEdges} />

      {/* ── Alert banner (only when faults exist) ── */}
      <AlertBanner faultNodes={faultNodes} onNodeClick={handleAlertClick} />

      {/* ── Filter bar ── */}
      <StatusFilterBar
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* ── Main canvas area ── */}
      <div className="flex-1 relative overflow-hidden">
        <TopologyMap
          nodes={effectiveNodes}
          edges={effectiveEdges}
          selectedId={selectedId}
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
          statusFilter={statusFilter}
        />

        {/* ── Detail drawer ── */}
        <DetailDrawer
          element={selectedWithStatus?.data ?? null}
          elementType={selectedWithStatus?.type ?? null}
          onClose={handleClose}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
