import type { Status } from './topology';

export type ChangeLogEntryType = 'status-change' | 'note-added';

export interface ChangeLogEntry {
  id: string;
  /** ID of the node or edge this entry belongs to */
  elementId: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  type: ChangeLogEntryType;
  author: string;
  /** Present when type === 'status-change' */
  fromStatus?: Status;
  toStatus?: Status;
  /** Present when type === 'note-added' */
  note?: string;
}
