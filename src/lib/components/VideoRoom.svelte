<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { disconnectFromRoom } from '$lib/services/twilio';
  import type { Room, RemoteParticipant } from 'twilio-video';

  export let room: Room;
  export let roomName: string;

  let localVideoElement: HTMLVideoElement;
  let remoteVideoElements: Map<string, HTMLVideoElement> = new Map();

  onMount(() => {
    if (room.localParticipant.videoTracks.size > 0) {
      const track = Array.from(room.localParticipant.videoTracks.values())[0].track;
      track.attach(localVideoElement);
    }

    room.on('trackSubscribed', (track, publication, participant) => {
      if (track.kind === 'video') {
        const element = document.createElement('video');
        element.autoplay = true;
        element.playsInline = true;
        track.attach(element);
        remoteVideoElements.set(participant.sid, element);
      }
    });

    room.on('trackUnsubscribed', (track, publication, participant) => {
      if (track.kind === 'video') {
        const element = remoteVideoElements.get(participant.sid);
        if (element) {
          track.detach(element);
          remoteVideoElements.delete(participant.sid);
        }
      }
    });

    room.participants.forEach((participant: RemoteParticipant) => {
      participant.videoTracks.forEach((publication) => {
        if (publication.track) {
          const element = document.createElement('video');
          element.autoplay = true;
          element.playsInline = true;
          publication.track.attach(element);
          remoteVideoElements.set(participant.sid, element);
        }
      });
    });
  });

  async function handleDisconnect() {
    await disconnectFromRoom(room);
    window.location.reload();
  }

  onDestroy(() => {
    remoteVideoElements.forEach((element, sid) => {
      const participant = room.participants.get(sid);
      if (participant) {
        participant.videoTracks.forEach((publication) => {
          if (publication.track) {
            publication.track.detach(element);
          }
        });
      }
    });
  });
</script>

<div class="flex flex-col h-screen bg-gray-900">
  <header class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <div>
      <h1 class="text-xl font-bold">Room: {roomName}</h1>
      <p class="text-sm text-gray-400">Participants: {room.participants.size + 1}</p>
    </div>
    <button
      on:click={handleDisconnect}
      class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
    >
      Leave Room
    </button>
  </header>

  <div class="flex-1 flex overflow-hidden">
    <div class="flex-1 p-4 overflow-y-auto">
      <div class="mb-4">
        <h2 class="text-white mb-2">You</h2>
        <div class="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            bind:this={localVideoElement}
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover"
          ></video>
        </div>
      </div>

      {#if Array.from(remoteVideoElements.values()).length > 0}
        <h2 class="text-white mb-2">Others</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each Array.from(remoteVideoElements.values()) as videoElement}
            <div class="relative bg-black rounded-lg overflow-hidden aspect-video">
              {@html videoElement.outerHTML}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <slot></slot>
  </div>
</div>
