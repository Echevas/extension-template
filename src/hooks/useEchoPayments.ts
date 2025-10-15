import { EchoClient, parseEchoError } from '@merit-systems/echo-typescript-sdk';
import { useCallback, useState } from 'react';

export function useEchoPayments(echoClient: EchoClient | null) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPaymentLink = useCallback(
    async (
      amount: number,
      description?: string,
      successUrl?: string
    ): Promise<string> => {
      if (!echoClient) {
        throw new Error('Not authenticated');
      }

      setIsLoading(true);
      try {
        // Get active tab URL
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab?.url) {
          throw new Error('No active tab');
        }

        const activeTabUrl = new URL(activeTab.url).origin;

        const response = await echoClient.payments.createPaymentLink({
          amount,
          description: description || 'Echo Credits',
          successUrl: successUrl || activeTabUrl,
        });

        setError(null);
        return response.paymentLink.url;
      } catch (err) {
        const echoError = parseEchoError(
          err instanceof Error ? err : new Error(String(err)),
          'creating payment link'
        );
        setError(echoError.message);
        throw echoError;
      } finally {
        setIsLoading(false);
      }
    },
    [echoClient]
  );

  return {
    createPaymentLink,
    error,
    isLoading,
  };
}