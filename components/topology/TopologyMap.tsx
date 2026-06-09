'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DeviceNode } from './DeviceNode';
import { BackgroundCellNode, buildBackgroundCells } from './BackgroundCellNode';
import { ZoneLegend } from './ZoneLegend';
import { PowerCableEdge } from './PowerCableEdge';
import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import type { BuildingFilter } from '@/lib/topologyFilters';
import type { DerivedStatuses, DerivedStatus } from '@/lib/faultCascade';
import type { BuildingColConfig } from '@/lib/siteLayout';

const nodeTypes: NodeTypes = {
  device: DeviceNode,
  backgroundCell: BackgroundCellNode,
};
const edgeTypes: EdgeTypes = { powerCable: PowerCableEdge };

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedId: string | null;
  buildingFilter: BuildingFilter;
  onNodeSelect: (node: TopologyNode) => void;
  onEdgeSelect: (edge: TopologyEdge) => void;
  statusFilter: Status | 'all';
  derivedStatuses: DerivedStatuses;
  buildingCols: BuildingColConfig[];
  /** When true nodes are draggable; drag-stop logs positionOverride snippet to console */
  layoutMode?: boolean;
}

export function TopologyMap({
  nodes,
  edges,
  selectedId,
  buildingFilter,
  onNodeSelect,
  onEdgeSelect,
  statusFilter,
  derivedStatuses,
  buildingCols,
  layoutMode = false,
}: TopologyMapProps) {
  const backgroundCells = useMemo(
    () => buildBackgroundCells(buildingCols),
    [buildingCols]
  );

  const rfNodes = useMemo(() => {
    const deviceNodes: Node[] = nodes.map(
      (node) =>
        ({
          id: node.id,
          type: 'device',
          position: node.position,
          data: {
            ...(node as unknown as Record<string, unknown>),
            compact: node.mapScope === 'building-detail' || node.layer === 'junction',
            derivedStatus: derivedStatuses.get(node.id) ?? null,
          },
          selectable: true,
          draggable: layoutMode,
          selected: node.id === selectedId,
          zIndex: 1,
          style: {
            opacity:
              statusFilter === 'all' || node.status === statusFilter ? 1 : 0.18,
            transition: 'opacity 0.25s ease',
            cursor: layoutMode ? 'grab' : undefined,
          },
        }) as Node
    );

    const bgNodes: Node[] =
      buildingFilter === 'all' ? (backgroundCells as Node[]) : [];

    return [...bgNodes, ...deviceNodes];
  }, [nodes, selectedId, statusFilter, buildingFilter, derivedStatuses, backgroundCells]);

  // ── Derived edge status: an edge inherits fault/investigation if its
  //    source node is faulted/derived-faulted in the BFS cascade result.
  const derivedEdgeStatusMap = useMemo((): Map<string, DerivedStatus> => {
    const nodeActual = new Map(nodes.map((n) => [n.id, n.status]));
    const result = new Map<string, DerivedStatus>();
    for (const e of edges) {
      const src = nodeActual.get(e.source);
      const srcD = derivedStatuses.get(e.source);
      if (src === 'fault' || srcD === 'derived-fault') {
        result.set(e.id, 'derived-fault');
      } else if (src === 'investigation' || srcD === 'derived-investigation') {
        result.set(e.id, 'derived-investigation');
      }
    }
    return result;
  }, [nodes, edges, derivedStatuses]);

  const rfEdges = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'powerCable',
        data: {
          // parallelIndex / totalParallel / parallelBothEnds are already injected
          // by assignParallelIndices in page.tsx — spread them through unchanged.
          ...(edge as unknown as Record<string, unknown>),
          derivedStatus: derivedEdgeStatusMap.get(edge.id) ?? null,
        },
        selected: edge.id === selectedId,
        zIndex: 0,
        style: {
          opacity:
            statusFilter === 'all' || edge.status === statusFilter ? 1 : 0.12,
          transition: 'opacity 0.25s ease',
        },
      })) as Edge[],
    [edges, selectedId, statusFilter, derivedEdgeStatusMap]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('__bg-')) return;
      onNodeSelect(node.data as unknown as TopologyNode);
    },
    [onNodeSelect]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      onEdgeSelect(edge.data as unknown as TopologyEdge);
    },
    [onEdgeSelect]
  );

  /**
   * Layout Mode helper: when a node is dropped, log a ready-to-paste
   * positionOverride snippet so you can persist the position in the data file.
   */
  const onNodeDragStop: OnNodeDrag = useCallback(
    (_event, node: Node) => {
      if (!layoutMode || node.id.startsWith('__bg-')) return;
      const x = Math.round(node.position.x);
      const y = Math.round(node.position.y);
      console.info(
        `%c[Layout] ${node.id}  →  positionOverride: { x: ${x}, y: ${y} }`,
        'color: #fbbf24;'
      );
      console.info(
        `  // In your installation .ts file, add to the node definition:\n  positionOverride: { x: ${x}, y: ${y} },`
      );
    },
    [layoutMode]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.12, minZoom: 0.2, maxZoom: 1 }}
        nodesDraggable={layoutMode}
        nodesConnectable={false}
        panOnScroll={!layoutMode}
        zoomOnScroll
        zoomOnPinch
        minZoom={0.12}
        maxZoom={2}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="#1e293b"
          style={{ opacity: 0.4 }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>

      {layoutMode && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold pointer-events-none select-none"
          style={{
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.5)',
            color: '#fbbf24',
            backdropFilter: 'blur(6px)',
          }}
        >
          <span style={{ fontSize: 10 }}>⠿</span>
          Layout Mode — drag nodes · positions logged to console · press L to exit
        </div>
      )}

      <ZoneLegend buildingFilter={buildingFilter} />
    </div>
  );
}
