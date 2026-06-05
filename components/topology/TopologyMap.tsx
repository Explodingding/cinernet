'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DeviceNode } from './DeviceNode';
import { PowerCableEdge } from './PowerCableEdge';
import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';

const nodeTypes: NodeTypes = { device: DeviceNode };
const edgeTypes: EdgeTypes = { powerCable: PowerCableEdge };

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedId: string | null;
  onNodeSelect: (node: TopologyNode) => void;
  onEdgeSelect: (edge: TopologyEdge) => void;
  statusFilter: Status | 'all';
}

export function TopologyMap({
  nodes,
  edges,
  selectedId,
  onNodeSelect,
  onEdgeSelect,
  statusFilter,
}: TopologyMapProps) {
  const rfNodes = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: 'device',
        position: node.position,
        data: node as unknown as Record<string, unknown>,
        selectable: true,
        draggable: false,
        selected: node.id === selectedId,
        style: {
          opacity:
            statusFilter === 'all' || node.status === statusFilter ? 1 : 0.18,
          transition: 'opacity 0.25s ease',
        },
      })) as Node[],
    [nodes, selectedId, statusFilter]
  );

  const rfEdges = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'powerCable',
        data: edge as unknown as Record<string, unknown>,
        selected: edge.id === selectedId,
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
    <div className="w-full h-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        minZoom={0.25}
        maxZoom={3}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={50}
          size={1}
          color="#1e293b"
          style={{ opacity: 0.6 }}
        />

        <MiniMap
          nodeColor={(node: Node) => {
            const d = node.data as unknown as TopologyNode | undefined;
            return STATUS_CONFIG[d?.status ?? 'operational'].color;
          }}
          style={{
            background: '#0a0f1a',
            border: '1px solid #1e293b',
          }}
          maskColor="rgba(10, 15, 26, 0.65)"
          pannable
          zoomable
        />

        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
