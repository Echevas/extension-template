import { useChat as useChatBase } from '@ai-sdk/react';
import { type ChatTransport, type UIMessage } from 'ai';
import { useEchoChatConfig } from '@/contexts/echoChat';

function createInMemoryChatTransport(): ChatTransport<UIMessage> {
  const chatFn = useEchoChatConfig();
  return {
    sendMessages: async options => {
      return chatFn(options);
    },
    async reconnectToStream() {
      return null;
    },
  };
}

export function useChat() {
  const transport = createInMemoryChatTransport();
  return useChatBase({ transport });
}
