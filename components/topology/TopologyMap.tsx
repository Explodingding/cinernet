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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DeviceNode } from './DeviceNode';
import { BackgroundCellNode, buildBackgroundCells } from './BackgroundCellNode';
import { ZoneLegend } from './ZoneLegend';
import { PowerCableEdge } from './PowerCableEdge';
import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import type { BuildingFilter } from '@/lib/topologyFilters';

const nodeTypes: NodeTypes = {
  device: DeviceNode,
  backgroundCell: BackgroundCellNode,
};
const edgeTypes: EdgeTypes = { powerCable: PowerCableEdge };

const BACKGROUND_CELLS = buildBackgroundCells();

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  /** Highlighted node/edge ID — visual ring only (single click) */
  highlightedId: string | null;
  /** Opened element ID — drives the detail drawer (double click) */
  openedId: string | null;
  buildingFilter: BuildingFilter;
  /** Single click → highlight ring only, no drawer */
  onNodeHighlight: (node: TopologyNode) => void;
  /** Double click → open detail drawer */
  onNodeOpen: (node: TopologyNode) => void;
  /** Edge single click always opens the drawer (edges are small targets) */
  onEdgeOpen: (edge: TopologyEdge) => void;
  statusFilter: Status | 'all';
}

export function TopologyMap({
  nodes,
  edges,
  highlightedId,
  openedId,
  buildingFilter,
  onNodeHighlight,
  onNodeOpen,
  onEdgeOpen,
  statusFilter,
}: TopologyMapProps) {
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
            /** 'open' = detail drawer is showing this node */
            highlighted: node.id === highlightedId,
            opened: node.id === openedId,
          },
          selectable: true,
          draggable: false,
          /** React Flow 'selected' drives the blue outline — we repurpose it for highlight */
          selected: node.id === highlightedId,
          zIndex: 1,
          style: {
            opacity:
              statusFilter === 'all' || node.status === statusFilter ? 1 : 0.18,
            transition: 'opacity 0.25s ease',
          },
        }) as Node
    );

    const bgNodes: Node[] =
      buildingFilter === 'all' ? (BACKGROUND_CELLS as Node[]) : [];

    return [...bgNodes, ...deviceNodes];
  }, [nodes, highlightedId, openedId, statusFilter, buildingFilter]);

  const rfEdges = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'powerCable',
        data: edge as unknown as Record<string, unknown>,
        selected: edge.id === openedId,
        zIndex: 0,
        style: {
          opacity:
            statusFilter === 'all' || edge.status === statusFilter ? 1 : 0.12,
          transition: 'opacity 0.25s ease',
        },
      })) as Edge[],
    [edges, openedId, statusFilter]
  );

  /** Single click → highlight ring only */
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('__bg-')) return;
      onNodeHighlight(node.data as unknown as TopologyNode);
    },
    [onNodeHighlight]
  );

  /** Double click → open detail drawer */
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('__bg-')) return;
      onNodeOpen(node.data as unknown as TopologyNode);
    },
    [onNodeOpen]
  );

  /** Edge click always opens drawer (edges are thin — too hard to double-click) */
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      onEdgeOpen(edge.data as unknown as TopologyEdge);
    },
    [onEdgeOpen]
  );

  /** Click on empty canvas → deselect */
  const onPaneClick = useCallback(() => {
    onNodeHighlight(null as unknown as TopologyNode);
  }, [onNodeHighlight]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.12, minZoom: 0.2, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
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

      <ZoneLegend buildingFilter={buildingFilter} />
    </div>
  );
}
