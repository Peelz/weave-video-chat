<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { connectToRoom } from '$lib/services/twilio';

  const dispatch = createEventDispatcher();

  let token = '';
  let roomName = '';
  let isLoading = false;
  let error = '';

  async function handleSubmit() {
    if (!token || !roomName) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const room = await connectToRoom({ token, roomName });
      dispatch('connected', { room, roomName });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to connect';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Join Video Room</h1>
    
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="token" class="block text-sm font-medium text-gray-700 mb-1">JWT Token</label>
        <textarea
          id="token"
          bind:value={token}
          placeholder="Paste your Twilio JWT token here"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div>
        <label for="roomName" class="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
        <input
          id="roomName"
          type="text"
          bind:value={roomName}
          placeholder="Enter room name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Connecting...' : 'Join Room'}
      </button>
    </form>
  </div>
</div>
