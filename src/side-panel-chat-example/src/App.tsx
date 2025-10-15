import {
  useEcho,
} from '@/hooks/useEcho';
import { useEchoModelProviders } from '@/hooks/useEchoModelProviders';
import { EchoProvider } from '@/contexts/echo';
import { EchoChatProvider, type ChatSendParams } from '@/contexts/echoChat';


import { convertToModelMessages, streamText } from 'ai';
import Chat from './chat';
import Header from './header';

function App() {
  return (
    <div className={`flex h-screen flex-col antialiased`}>
      <EchoProvider>
        <Header title="Echo Chat" />
        <div className="min-h-0 flex-1">
          <ChatWrapper />
        </div>
      </EchoProvider>
    </div>
  );
}

export function ChatWrapper() {
  const { openai } = useEchoModelProviders();
  const { user } = useEcho();

  async function doChat(params: ChatSendParams) {
    const modelMessages = params.messages;
    const result = streamText({
      model: openai('gpt-5'),
      messages: convertToModelMessages(modelMessages),
    });
    return result.toUIMessageStream(); // in-memory UI chunk stream
  }

  return (
    <EchoChatProvider chatFn={doChat} key={user?.id}>
      <Chat />
    </EchoChatProvider>
  );
}

export default App;
