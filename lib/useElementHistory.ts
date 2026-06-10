'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Status } from '@/types/topology';
import type { ChangeLogEntry } from '@/types/history';

const STORAGE_KEY = 'cinernet-history';

// ─── Demo seed data ────────────────────────────────────────────────────────────
// Shown on first page load (empty localStorage) so the demo immediately has
// realistic history for the two most interesting devices.
const DEMO_SEED: ChangeLogEntry[] = [
  // TR-SPARE — under investigation
  {
    id: 'seed-tr-spare-1',
    elementId: 'TR-SPARE',
    timestamp: '2026-05-15T08:14:00Z',
    type: 'status-change',
    author: 'J. Kowalski',
    fromStatus: 'operational',
    toStatus: 'investigation',
  },
  {
    id: 'seed-tr-spare-2',
    elementId: 'TR-SPARE',
    timestamp: '2026-05-15T08:21:00Z',
    type: 'note-added',
    author: 'J. Kowalski',
    note: 'Insulation resistance test scheduled. Contactor shows abnormal heating on phase L2. Spare transformer taken offline for inspection.',
  },
  {
    id: 'seed-tr-spare-3',
    elementId: 'TR-SPARE',
    timestamp: '2026-05-28T11:05:00Z',
    type: 'note-added',
    author: 'M. Nowak',
    note: 'ABB service contacted (ticket #ABB-2026-0421). On-site visit scheduled 2026-06-04. Test report pending.',
  },
  // MAIN-MV-PANEL
  {
    id: 'seed-mv-1',
    elementId: 'MAIN-MV-PANEL',
    timestamp: '2026-04-10T09:00:00Z',
    type: 'status-change',
    author: 'P. Smith',
    fromStatus: 'operational',
    toStatus: 'operational',
  },
  {
    id: 'seed-mv-2',
    elementId: 'MAIN-MV-PANEL',
    timestamp: '2026-04-10T09:00:00Z',
    type: 'note-added',
    author: 'P. Smith',
    note: 'Initial commissioning completed. All three outgoing feeders tested at 26 kV. Protection relays calibrated and function-tested.',
  },
  {
    id: 'seed-mv-3',
    elementId: 'MAIN-MV-PANEL',
    timestamp: '2026-06-01T14:30:00Z',
    type: 'note-added',
    author: 'J. Kowalski',
    note: 'Annual visual inspection passed. Busbar connections retightened. No signs of arcing or overheating.',
  },
  // TR1-1
  {
    id: 'seed-tr11-1',
    elementId: 'TR1-1',
    timestamp: '2026-04-11T10:00:00Z',
    type: 'note-added',
    author: 'P. Smith',
    note: 'First energisation successful. Voltage ratio test OK. No unusual noise or vibration.',
  },
];

// ─── Read helpers ──────────────────────────────────────────────────────────────

function loadEntries(): ChangeLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First load — seed with demo data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
      return DEMO_SEED;
    }
    return JSON.parse(raw) as ChangeLogEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: ChangeLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export interface ElementHistoryApi {
  /** All entries for a specific elementId, newest first */
  getHistory: (elementId: string) => ChangeLogEntry[];
  /** Log a status transition (call from handleStatusChange in page.tsx) */
  addStatusChange: (elementId: string, from: Status, to: Status, author?: string) => void;
  /** Add a free-text note */
  addNote: (elementId: string, note: string, author?: string) => void;
}

export function useElementHistory(): ElementHistoryApi {
  const [entries, setEntries] = useState<ChangeLogEntry[]>(() => loadEntries());

  // Keep localStorage in sync whenever entries change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = useCallback((entry: Omit<ChangeLogEntry, 'id' | 'timestamp'>) => {
    const full: ChangeLogEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setEntries((prev) => [...prev, full]);
  }, []);

  const getHistory = useCallback(
    (elementId: string) =>
      entries
        .filter((e) => e.elementId === elementId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [entries]
  );

  const addStatusChange = useCallback(
    (elementId: string, from: Status, to: Status, author = 'Operator') => {
      addEntry({ elementId, type: 'status-change', author, fromStatus: from, toStatus: to });
    },
    [addEntry]
  );

  const addNote = useCallback(
    (elementId: string, note: string, author = 'Operator') => {
      addEntry({ elementId, type: 'note-added', author, note });
    },
    [addEntry]
  );

  return { getHistory, addStatusChange, addNote };
}
