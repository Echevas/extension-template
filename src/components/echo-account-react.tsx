import { useEcho } from '@/hooks/useEcho';
import { EchoAccountButton } from './echo-account';

export function EchoAccount() {
  const echo = useEcho();
  return <EchoAccountButton echo={echo} />;
}
