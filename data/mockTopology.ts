import { utilityInstallation } from './installations/utility';
import { furnace10Installation } from './installations/furnace-10';
import { batchHouseInstallation } from './installations/batch-house';
import { siteFeederEdges } from './installations/site-feeders';
import type { SiteInstallation, TopologyNodeInput } from '@/types/topology';

/**
 * Active installations — hyper-focused 3-building scope.
 * Furnace-20 data (installations/furnace-20.ts) is frozen and intentionally
 * not imported; re-add it to this array when Phase 2 work resumes.
 */
export const SITE_INSTALLATIONS: SiteInstallation[] = [
  utilityInstallation,
  furnace10Installation,
  batchHouseInstallation,
];

export const topologyNodeInputs: TopologyNodeInput[] =
  SITE_INSTALLATIONS.flatMap((i) => i.nodes);

export const topologyEdges = [
  ...SITE_INSTALLATIONS.flatMap((i) => i.edges),
  ...siteFeederEdges,
];

export {
  utilityInstallation,
  furnace10Installation,
  batchHouseInstallation,
  siteFeederEdges,
};
