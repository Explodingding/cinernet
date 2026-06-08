/** Commissioning row from all_TB_commissioning_items.csv (Excel export). */
export type TerminalItemGroup =
  | 'power'
  | 'fuse'
  | 'field'
  | 'di'
  | 'do'
  | 'earth'
  | 'io';

export type SignalLayer = 'power' | 'plc';

export interface TerminalBoxCommissioningItem {
  title: string;
  itemId: string;
  itemGroup: TerminalItemGroup;
  equipmentClass: string;
  functionalRole: string;
  physicalRow: string;
  drawingReference: string;
  status: string;
  found: boolean;
  labelOk: boolean;
  cableMarkerOk: boolean;
  continuityOk: boolean;
  peOk: boolean;
  loopOk: boolean;
  notes?: string;
  relatedCable?: string;
  relatedLoop?: string;
  /** power = MVP checklist; plc = shown but not on power map yet */
  signalLayer: SignalLayer;
}

export interface TerminalBoxSummary {
  terminalBoxId: string;
  project: string;
  itemCount: number;
  byGroup: Record<TerminalItemGroup, number>;
  drawingReferences: string[];
  powerItemCount: number;
  plcItemCount: number;
}

export interface TerminalBoxDetail {
  summary: TerminalBoxSummary;
  items: TerminalBoxCommissioningItem[];
}

export const PLC_ITEM_GROUPS: TerminalItemGroup[] = ['di', 'do', 'io'];
export const POWER_ITEM_GROUPS: TerminalItemGroup[] = ['power', 'fuse', 'field', 'earth'];

export function itemSignalLayer(group: TerminalItemGroup): SignalLayer {
  return PLC_ITEM_GROUPS.includes(group) ? 'plc' : 'power';
}
