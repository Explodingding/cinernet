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
import type { DerivedStatuses } from '@/lib/faultCascade';
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
          draggable: false,
          selected: node.id === selectedId,
          zIndex: 1,
          style: {
            opacity:
              statusFilter === 'all' || node.status === statusFilter ? 1 : 0.18,
            transition: 'opacity 0.25s ease',
          },
        }) as Node
    );

    const bgNodes: Node[] =
      buildingFilter === 'all' ? (backgroundCells as Node[]) : [];

    return [...bgNodes, ...deviceNodes];
  }, [nodes, selectedId, statusFilter, buildingFilter, derivedStatuses, backgroundCells]);

  const rfEdges = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'powerCable',
        data: edge as unknown as Record<string, unknown>,
        selected: edge.id === selectedId,
        zIndex: 0,
        style: {
          opacity:
            statusFilter === 'all' || edge.status === statusFilter ? 1 : 0.12,
          transition: 'opacity 0.25s ease',
        },
      })) as Edge[],
    [edges, selectedId, statusFilter]
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

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
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
