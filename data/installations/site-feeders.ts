import type { TopologyEdgeInput } from '@/types/topology';

/**
 * Cross-building LV feeders (400 V) from Utility Building feeder transformers
 * to the first distribution panel in each remote building.
 *
 * Source: SMT-5250 CNRBE-PMEP18-AB-XXX — Power Distribution System Riser Plan
 */
export const siteFeederEdges: TopologyEdgeInput[] = [];
