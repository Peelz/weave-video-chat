<script lang="ts">
	import { onMount } from 'svelte';
	import JoinForm from '$lib/components/JoinForm.svelte';
	import VideoRoom from '$lib/components/VideoRoom.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import type { Room } from 'twilio-video';

	let room: Room | null = null;
	let roomName = '';
	let showVideoRoom = false;

	function handleConnected(event: CustomEvent) {
		room = event.detail.room;
		roomName = event.detail.roomName;
		showVideoRoom = true;
	}
</script>

<svelte:head>
	<title>Twilio Video Chat</title>
	<meta name="description" content="Video chat application with Twilio" />
</svelte:head>

{#if !showVideoRoom}
	<JoinForm on:connected={handleConnected} />
{:else if room}
	<VideoRoom {room} {roomName}>
		<Chat />
	</VideoRoom>
{/if}
