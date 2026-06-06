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
import { BuildingColumnGuides } from './BuildingColumnGuides';
import { ZoneLegend } from './ZoneLegend';
import { PowerCableEdge } from './PowerCableEdge';
import type { TopologyNode, TopologyEdge, Status } from '@/types/topology';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { ZONE_CONFIG } from '@/lib/zoneConfig';
import type { BuildingFilter } from '@/lib/topologyFilters';

const nodeTypes: NodeTypes = { device: DeviceNode };
const edgeTypes: EdgeTypes = { powerCable: PowerCableEdge };

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  selectedId: string | null;
  buildingFilter: BuildingFilter;
  onNodeSelect: (node: TopologyNode) => void;
  onEdgeSelect: (edge: TopologyEdge) => void;
  statusFilter: Status | 'all';
}

export function TopologyMap({
  nodes,
  edges,
  selectedId,
  buildingFilter,
  onNodeSelect,
  onEdgeSelect,
  statusFilter,
}: TopologyMapProps) {
  const rfNodes = useMemo(
    () =>
      nodes.map(
        (node) =>
          ({
            id: node.id,
            type: 'device',
            position: node.position,
            data: {
              ...(node as unknown as Record<string, unknown>),
              compact: node.mapScope === 'building-detail' || node.layer === 'junction',
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
      ),
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

  const showColumnGuides = buildingFilter === 'all';

  return (
    <div className="w-full h-full relative">
      <BuildingColumnGuides visible={showColumnGuides} />

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.15, minZoom: 0.25, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        minZoom={0.15}
        maxZoom={2}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e293b"
          style={{ opacity: 0.45 }}
        />

        <MiniMap
          nodeColor={(node: Node) => {
            const d = node.data as unknown as TopologyNode | undefined;
            if (d?.physicalLocation?.zone) {
              return ZONE_CONFIG[d.physicalLocation.zone].color;
            }
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

      <ZoneLegend buildingFilter={buildingFilter} />
    </div>
  );
}
