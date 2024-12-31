import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Presence represents the properties that exist on every user in the room
type Presence = {
  cursor: { x: number; y: number } | null;
  selectedQuotaId: string | null;
  isEditing: boolean;
};

// Storage represents the shared document that persists in the room
type Storage = {
  quotaNotes: Record<string, string[]>;
  sharedAnnotations: Array<{
    id: string;
    quotaId: string;
    text: string;
    author: string;
    timestamp: number;
  }>;
  collaborativeFilters: {
    dateRange: [string, string] | null;
    vessels: string[];
    status: string[];
  };
};

// User meta information
type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    role: string;
  };
};

// Room events
type RoomEvent = {
  type: 'QUOTA_UPDATE' | 'ANNOTATION_ADDED' | 'FILTER_CHANGE';
  user: string;
  data: any;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useSelf,
    useStorage,
    useMutation,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useBatch,
    useStatus,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

// Custom hooks for collaboration features

export function useCollaborativeEditing(quotaId: string) {
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const storage = useStorage();

  const startEditing = () => {
    updateMyPresence({ isEditing: true, selectedQuotaId: quotaId });
  };

  const stopEditing = () => {
    updateMyPresence({ isEditing: false, selectedQuotaId: null });
  };

  const isBeingEditedByOthers = others.some(
    other => other.presence.isEditing && other.presence.selectedQuotaId === quotaId
  );

  return {
    isEditing: myPresence.isEditing,
    isBeingEditedByOthers,
    startEditing,
    stopEditing,
  };
}

export function useCollaborativeNotes(quotaId: string) {
  const storage = useStorage();
  const updateStorage = useMutation(({ storage }, note: string) => {
    const notes = storage.get('quotaNotes').get(quotaId) || [];
    storage.get('quotaNotes').set(quotaId, [...notes, note]);
  }, []);

  return {
    notes: storage?.quotaNotes[quotaId] || [],
    addNote: updateStorage,
  };
}

export function useCollaborativeAnnotations(quotaId: string) {
  const storage = useStorage();
  const self = useSelf();

  const addAnnotation = useMutation(({ storage }, text: string) => {
    const annotations = storage.get('sharedAnnotations');
    annotations.push({
      id: Math.random().toString(36).substr(2, 9),
      quotaId,
      text,
      author: self.info.name,
      timestamp: Date.now(),
    });
  }, []);

  const annotations = storage?.sharedAnnotations.filter(a => a.quotaId === quotaId) || [];

  return {
    annotations,
    addAnnotation,
  };
}

export function useCollaborativeFilters() {
  const storage = useStorage();
  const updateFilters = useMutation(({ storage }, updates: Partial<Storage['collaborativeFilters']>) => {
    const filters = storage.get('collaborativeFilters');
    Object.assign(filters, updates);
  }, []);

  return {
    filters: storage?.collaborativeFilters,
    updateFilters,
  };
}

export function useCollaborativeCursors() {
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  const updateCursor = (x: number, y: number) => {
    updateMyPresence({ cursor: { x, y } });
  };

  const removeCursor = () => {
    updateMyPresence({ cursor: null });
  };

  return {
    cursors: others.map(other => ({
      connectionId: other.connectionId,
      cursor: other.presence.cursor,
      user: other.info,
    })),
    updateCursor,
    removeCursor,
  };
}
