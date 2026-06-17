<script lang="ts">
  import { chatStore, clearChatMessages } from '$lib/stores/chat';
  import { sendChatMessage } from '$lib/services/twilio';
  import type { ChatMessage } from '$lib/types/twilio';
  import { onDestroy } from 'svelte';

  let newMessage = '';
  let chatMessages: ChatMessage[] = [];
  let chatContainer: HTMLDivElement;

  chatStore.subscribe((value) => {
    chatMessages = value;
  });

  function sendMessage() {
    if (!newMessage.trim()) return;
    sendChatMessage(newMessage.trim());
    newMessage = '';
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  $: if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  onDestroy(() => {
    clearChatMessages();
  });
</script>

<div class="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
  <div class="p-4 border-b border-gray-700">
    <h2 class="text-white font-bold text-lg">Chat</h2>
  </div>

  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-3">
    {#if chatMessages.length === 0}
      <p class="text-gray-400 text-center text-sm">No messages yet</p>
    {:else}
      {#each chatMessages as message (message.id)}
        <div class="flex {message.isLocal ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[80%] {message.isLocal ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg px-3 py-2">
            {#if !message.isLocal}
              <p class="text-xs text-blue-400 mb-1">{message.author}</p>
            {/if}
            <p class="text-white text-sm">{message.body}</p>
            <p class="text-xs text-gray-300 mt-1 text-right">{formatTime(message.timestamp)}</p>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="p-4 border-t border-gray-700">
    <form on:submit|preventDefault={sendMessage} class="flex gap-2">
      <input
        type="text"
        bind:value={newMessage}
        placeholder="Type a message..."
        class="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        type="submit"
        disabled={!newMessage.trim()}
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </form>
  </div>
</div>
