import { writable, derived } from 'svelte/store';
import type { Room, LocalParticipant, RemoteParticipant } from 'twilio-video';

interface VideoStore {
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipants: Map<string, RemoteParticipant>;
  isConnecting: boolean;
  error: string | null;
}

function createVideoStore() {
  const { subscribe, set, update } = writable<VideoStore>({
    room: null,
    localParticipant: null,
    remoteParticipants: new Map(),
    isConnecting: false,
    error: null,
  });

  return {
    subscribe,
    setRoom: (room: Room | null) => update(s => ({ ...s, room })),
    setLocalParticipant: (participant: LocalParticipant | null) => update(s => ({ ...s, localParticipant: participant })),
    setConnecting: (isConnecting: boolean) => update(s => ({ ...s, isConnecting })),
    setError: (error: string | null) => update(s => ({ ...s, error })),
    addRemoteParticipant: (sid: string, participant: RemoteParticipant) => update(s => {
      const newParticipants = new Map(s.remoteParticipants);
      newParticipants.set(sid, participant);
      return { ...s, remoteParticipants: newParticipants };
    }),
    removeRemoteParticipant: (sid: string) => update(s => {
      const newParticipants = new Map(s.remoteParticipants);
      newParticipants.delete(sid);
      return { ...s, remoteParticipants: newParticipants };
    }),
    reset: () => set({
      room: null,
      localParticipant: null,
      remoteParticipants: new Map(),
      isConnecting: false,
      error: null,
    }),
  };
}

export const videoStore = createVideoStore();
