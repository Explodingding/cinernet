import { utilityInstallation } from './installations/utility';
import { furnace10Installation } from './installations/furnace-10';
import { batchHouseInstallation } from './installations/batch-house';
import { siteFeederEdges } from './installations/site-feeders';
import { layoutNodes } from '@/lib/siteLayout';
import type { SiteInstallation } from '@/types/topology';

export const SITE_INSTALLATIONS: SiteInstallation[] = [
  utilityInstallation,
  furnace10Installation,
  batchHouseInstallation,
];

const allNodeInputs = SITE_INSTALLATIONS.flatMap((i) => i.nodes);
const allEdgeInputs = [
  ...SITE_INSTALLATIONS.flatMap((i) => i.edges),
  ...siteFeederEdges,
];

export const topologyNodes = layoutNodes(allNodeInputs);
export const topologyEdges = allEdgeInputs;

export { utilityInstallation, furnace10Installation, batchHouseInstallation, siteFeederEdges };
