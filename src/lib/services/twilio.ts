import pkg from 'twilio-video';
const { connect, LocalDataTrack } = pkg;
import type { Room, RemoteParticipant, LocalDataTrack as LocalDataTrackType } from 'twilio-video';
import { videoStore } from '$lib/stores/video';
import { addChatMessage } from '$lib/stores/chat';

export interface ConnectOptions {
  token: string;
  roomName: string;
  tracks?: any[];
}

// ponytail: chat rides the video room's data track — no chat grant/SDK.
// ceiling: no message history for late joiners; use Twilio Conversations if you need persistence.
let chatTrack: LocalDataTrackType | null = null;
let localIdentity = '';

export function sendChatMessage(body: string): void {
  const msg = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    author: localIdentity || 'You',
    body,
    timestamp: Date.now(),
  };
  chatTrack?.send(JSON.stringify(msg));
  addChatMessage({ ...msg, timestamp: new Date(msg.timestamp), isLocal: true });
}

export async function connectToRoom(options: ConnectOptions): Promise<Room> {
  videoStore.setConnecting(true);
  videoStore.setError(null);

  try {
    const room = await connect(options.token, {
      name: options.roomName,
      tracks: options.tracks,
    });

    videoStore.setRoom(room);
    videoStore.setLocalParticipant(room.localParticipant as any);

    localIdentity = room.localParticipant.identity;

    const watchDataTrack = (track: any) => {
      if (track.kind !== 'data') return;
      track.on('message', (raw: string) => {
        try {
          const m = JSON.parse(raw);
          addChatMessage({ id: m.id, author: m.author, body: m.body, timestamp: new Date(m.timestamp), isLocal: false });
        } catch {
          /* ignore non-chat data */
        }
      });
    };

    // Listen before publishing, and sweep tracks already subscribed at connect —
    // otherwise the first joiner misses the late joiner's track (and vice versa).
    room.on('trackSubscribed', watchDataTrack);
    room.participants.forEach((p: RemoteParticipant) => {
      p.dataTracks.forEach((pub: any) => pub.track && watchDataTrack(pub.track));
    });

    chatTrack = new LocalDataTrack();
    await room.localParticipant.publishTrack(chatTrack);

    room.on('participantConnected', (participant: RemoteParticipant) => {
      videoStore.addRemoteParticipant(participant.sid, participant as any);
    });

    room.on('participantDisconnected', (participant: RemoteParticipant) => {
      videoStore.removeRemoteParticipant(participant.sid);
    });

    room.participants.forEach((participant: RemoteParticipant) => {
      videoStore.addRemoteParticipant(participant.sid, participant as any);
    });

    return room;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to room';
    videoStore.setError(errorMessage);
    videoStore.setConnecting(false);
    throw error;
  }
}

export async function disconnectFromRoom(room: Room): Promise<void> {
  room.disconnect();
  chatTrack = null;
  videoStore.reset();
}
