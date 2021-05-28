export interface IOsfEventListener {
  on: string;
  call: (data: unknown, eventName: string) => void;
}

export const ALL_EVENTS = 'all';
export const MODEL_CHANGED_EVENT = 'change';
export const MODEL_ADDED_EVENT = 'add';
export const MODEL_REMOVED_EVENT = 'remove';
export const COLLECTION_RESETED_EVENT = 'reset';
