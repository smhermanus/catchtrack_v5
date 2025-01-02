import { TemplateComponent } from './template-types';

export interface RoomEvent {
  type: 'COMPONENTS_UPDATE';
  components: TemplateComponent[];
}

export interface Presence {
  id: string;
  name?: string;
  cursor?: { x: number; y: number };
  activeTab?: string;
}

export interface Storage {
  templates: TemplateComponent[];
  settings: Record<string, unknown>;
}

export interface UserMeta {
  id: string;
  name: string;
  avatar?: string;
}

export interface Room {
  broadcast: (event: RoomEvent) => void;
  subscribe: (callback: (event: RoomEvent) => void) => () => void;
  getPresence: () => Presence[];
  updatePresence: (presence: Partial<Presence>) => void;
}

export interface UseRoomReturn {
  room: Room;
  presence: Presence[];
  isConnected: boolean;
  error?: Error;
}

// Room hook implementation
import { useState, useEffect } from 'react';

export function useRoom(): UseRoomReturn {
  const [presence, setPresence] = useState<Presence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error>();

  // Mock room implementation - replace with your actual room service
  const room: Room = {
    broadcast: (event: RoomEvent) => {
      // Implement your broadcast logic here
      console.log('Broadcasting event:', event);
    },
    subscribe: (callback: (event: RoomEvent) => void) => {
      // Implement your subscription logic here
      return () => {
        // Cleanup subscription
      };
    },
    getPresence: () => presence,
    updatePresence: (newPresence: Partial<Presence>) => {
      // Implement presence update logic
      console.log('Updating presence:', newPresence);
    },
  };

  useEffect(() => {
    setIsConnected(true);
    return () => {
      setIsConnected(false);
    };
  }, []);

  return {
    room,
    presence,
    isConnected,
    error,
  };
}
