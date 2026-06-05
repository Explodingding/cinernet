'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { topologyNodes, topologyEdges } from '@/data/mockTopology';
import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import { BrandHeader } from '@/components/layout/BrandHeader';
import { KpiBar } from '@/components/layout/KpiBar';
import { AlertBanner } from '@/components/layout/AlertBanner';
import { StatusFilterBar } from '@/components/topology/StatusFilterBar';
import { DetailDrawer } from '@/components/detail/DetailDrawer';
import { Toast } from '@/components/ui/Toast';
import { getCascadeTargets } from '@/lib/troubleshooting';

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
          Loading topology...
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, Status>>({});
  const [edgeStatuses, setEdgeStatuses] = useState<Record<string, Status>>({});
  const [selected, setSelected] = useState<{
    data: TopologyNode | TopologyEdge;
    type: 'node' | 'edge';
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const selectedWithStatus = useMemo(() => {
    if (!selected) return null;
    if (selected.type === 'node') {
      const n = effectiveNodes.find((n) => n.id === selected.data.id);
      return n ? { data: n, type: 'node' as const } : null;
    }
    const e = effectiveEdges.find((e) => e.id === selected.data.id);
    return e ? { data: e, type: 'edge' as const } : null;
  }, [selected, effectiveNodes, effectiveEdges]);

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

  const handleMarkResolved = useCallback(
    (id: string, type: 'node' | 'edge') => {
      if (type === 'node') {
        setNodeStatuses((prev) => {
          const next: Record<string, Status> = { ...prev, [id]: 'operational' };
          const cascade = getCascadeTargets(id);
          cascade.nodes.forEach((nodeId) => {
            next[nodeId] = 'operational';
          });
          return next;
        });
        const cascade = getCascadeTargets(id);
        if (cascade.edges.length > 0) {
          setEdgeStatuses((prev) => {
            const next: Record<string, Status> = { ...prev };
            cascade.edges.forEach((edgeId) => {
              next[edgeId] = 'operational';
            });
            return next;
          });
        }
      } else {
        setEdgeStatuses((prev) => ({ ...prev, [id]: 'operational' }));
      }
    },
    []
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const selectedId = selectedWithStatus?.data.id ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <BrandHeader />
      <KpiBar nodes={effectiveNodes} edges={effectiveEdges} />
      <AlertBanner faultNodes={faultNodes} onNodeClick={handleAlertClick} />
      <StatusFilterBar activeFilter={statusFilter} onFilterChange={setStatusFilter} />

      <div className="flex-1 relative overflow-hidden min-h-0">
        <TopologyMap
          nodes={effectiveNodes}
          edges={effectiveEdges}
          selectedId={selectedId}
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
          statusFilter={statusFilter}
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
