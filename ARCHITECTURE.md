# CINERNET — Architecture Reference

Electrical topology monitoring dashboard for the Lommel Glass site.
Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind v4, `@xyflow/react`.
Deployed to GitHub Pages as a static export.

---

## Project goals

A troubleshooting-first map of the site's electrical infrastructure. A technician standing in front of a faulted machine must be able to identify the upstream fault path in seconds. Simplicity and physical accuracy take priority over feature density.

---

## Key architecture decisions

### 1. Physical map layout

The canvas is a 2-D grid:
- **X axis** — building columns (Furnace-10 | Utility | Batch House), left to right
- **Y axis** — floor bands (Elevated +5m | Ground 0m | Basement −3m), top to bottom within each band

Every node is positioned by `physicalLocation.building` + `physicalLocation.elevation`. There is no abstract tree layout.

Layout engine: `lib/siteLayout.ts` — `layoutNodes()`.

### 2. Three-tier progressive disclosure

The `activeTier` state in `page.tsx` controls which nodes are visible without any navigation. All nodes are positioned at startup; tier just controls opacity/visibility.

| Tier | Layers shown | Use case |
|---|---|---|
| 1 — Site | mv-feed, mv-switchgear, transformer, lv-panel | Factory overview, cross-building power paths |
| 2 — Building | + cabinet | Distribution cabinets per building |
| 3 — Circuit | + junction, load | Individual motors, drives, loads |

Each node in the data carries `displayTier?: 1 | 2 | 3` (default: 1). The filter is in `lib/topologyFilters.ts → filterMapNodes()`.

### 3. Cable-type filter

`visibleEdgeTypes: Set<EdgeType>` in `page.tsx`. Independent of the tier selector. Cable types defined in `types/topology.ts`:

```
mv | power | plc | signal | fieldbus | ethernet
```

Only types present in the loaded dataset appear in the TopBar dropdown.

### 4. Fault cascade (render-time BFS)

`lib/faultCascade.ts → computeDerivedStatuses()` runs on every render. It does a directed BFS downstream from any `fault` or `investigation` node, following edges source→target (power-flow direction). Result is a `Map<nodeId, 'derived-fault' | 'derived-investigation'>` that is overlaid on the node card as a softer indicator — never stored in data.

### 5. SCADA / OSAPIENS integration (extension point, not built)

Every node already carries:
```typescript
externalRefs: {
  scadaTag: 'LOMMEL.TR01.STATUS',
  osapiensAssetId: 'AST-TR-01',
}
```
When the integration is built, it will overlay live status at render time using the same pattern as fault cascade.

---

## Data files

| File | Purpose |
|---|---|
| `data/installations/utility.ts` | Utility Building — MV, transformers, main panels, cabinets, motors |
| `data/installations/batch-house.ts` | Batch House — DC cabinet, terminal box summary, TB grid |
| `data/installations/furnace-10.ts` | Furnace 10 — future |
| `data/mockTopology.ts` | Aggregates all installations |
| `data/buildings.ts` | Building metadata and column order |

### Adding a new node

1. Add to the relevant `data/installations/*.ts` file
2. Set `displayTier` (1/2/3) to control at which depth it appears
3. Set `layer` — determines Y position within its floor band (`lib/siteLayout.ts LAYER_RANK`)
4. Set `physicalLocation.elevation` — determines which floor band (`getFloorBandId`)

### Adding a new cable

1. Add edge to `data/installations/*.ts`
2. Set `edgeType` — one of `mv | power | plc | signal | fieldbus | ethernet`
3. If cross-building: set `route.spansBuildings: true`, `fromBuilding`, `toBuilding`

---

## Component map

```
app/page.tsx               — state: selected, activeTier, visibleEdgeTypes, buildingFilter
  TopBar                   — tier toggle, cable filter, fault list, building/status filters
  TopologyMap              — React Flow canvas, background grid, legend
    DeviceNode             — equipment card (status ring, derived-fault indicator, circuit badge)
    PowerCableEdge         — smart bezier routing (useInternalNode for attach-point calculation)
    BackgroundCellNode     — building×floor grid behind the nodes
  DetailDrawer             — specs, troubleshooting steps, status change controls
```

---

## Continuing development on another machine

1. Clone the repo from GitHub
2. `npm install`
3. `npm run dev`
4. Open this file and `.cursor/plans/scalable_topology_architecture.plan.md` for architecture context
5. The conversation summary from the previous session can be pasted into a new Cursor chat to restore AI context

---

## Transferring Cursor chat history manually

Chat history lives in:
```
%USERPROFILE%\.cursor\projects\c-Users-SPCX-Desktop-cinernet\
```

Copy this folder to the same path on the target machine. It contains:
- `agent-transcripts/` — full JSONL conversation history
- `canvases/` — any canvas files created in chat

The AI model reads the latest transcript summary automatically when you open the project.
