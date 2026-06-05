export type AssetType =
  | 'transformer'
  | 'panel'
  | 'cabinet'
  | 'junction-box'
  | 'motor';

export type Status = 'operational' | 'investigation' | 'fault';

export type EdgeType = 'power' | 'plc' | 'mv';

export interface TroubleshootingStep {
  id: string;
  text: string;
}

export interface DeviceSpecs {
  voltage?: string;
  current?: string;
  power?: string;
  protection?: string;
  location?: string;
  manufacturer?: string;
  notes?: string;
}

export interface CableSpecs {
  crossSection?: string;
  maxLoad?: string;
  length?: string;
  voltage?: string;
  installationType?: string;
  notes?: string;
}

export interface TopologyNode {
  id: string;
  name: string;
  assetType: AssetType;
  status: Status;
  specs: DeviceSpecs;
  troubleshootingSteps: TroubleshootingStep[];
  position: { x: number; y: number };
}

export interface TopologyEdge {
  id: string;
  name: string;
  source: string;
  target: string;
  edgeType: EdgeType;
  status: Status;
  specs: CableSpecs;
  troubleshootingSteps: TroubleshootingStep[];
}

export function isTopologyEdge(
  item: TopologyNode | TopologyEdge
): item is TopologyEdge {
  return 'source' in item;
}
