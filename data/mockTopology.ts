import { utilityInstallation } from './installations/utility';
import { furnace10Installation } from './installations/furnace-10';
import { furnace20Installation } from './installations/furnace-20';
import { batchHouseInstallation } from './installations/batch-house';
import { siteFeederEdges } from './installations/site-feeders';
import type { SiteInstallation, TopologyNodeInput } from '@/types/topology';

export const SITE_INSTALLATIONS: SiteInstallation[] = [
  utilityInstallation,
  furnace10Installation,
  furnace20Installation,
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
  furnace20Installation,
  batchHouseInstallation,
  siteFeederEdges,
};
