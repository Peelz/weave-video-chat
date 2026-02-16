import { writable } from 'svelte/store';
import type { ChatMessage } from '$lib/types/twilio';

export const chatStore = writable<ChatMessage[]>([]);

export function addChatMessage(message: ChatMessage) {
  chatStore.update(messages => [...messages, message]);
}

export function clearChatMessages() {
  chatStore.set([]);
}
