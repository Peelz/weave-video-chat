import { connect } from 'twilio-video';
import type { Room, RemoteParticipant } from 'twilio-video';
import { videoStore } from '$lib/stores/video';

export interface ConnectOptions {
  token: string;
  roomName: string;
  tracks?: any[];
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
  videoStore.reset();
}
