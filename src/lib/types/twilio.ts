export interface ChatMessage {
  id: string;
  author: string;
  body: string;
  timestamp: Date;
  isLocal: boolean;
}
