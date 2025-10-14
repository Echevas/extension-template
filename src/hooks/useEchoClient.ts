import {
    EchoClient,
    OAuthTokenProvider,
  } from "@merit-systems/echo-typescript-sdk";
  import { useEffect, useState } from "react";
  
  interface UseEchoClientOptions {
    apiUrl: string;
  }
  
  export function useEchoClient({ apiUrl }: UseEchoClientOptions) {
    const [token, setToken] = useState<string | null>(null);
    const [client, setClient] = useState<EchoClient | null>(null);
  
    // Get initial token and listen for changes
    useEffect(() => {
      const getToken = async () => {
        const result = await chrome.storage.local.get("echo_access_token");
        setToken(result.echo_access_token || null);
      };
  
      // Get initial token
      getToken();
  
      // Listen for storage changes
      const handleStorageChange = (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => {
        if (changes.echo_access_token) {
          setToken(changes.echo_access_token.newValue || null);
        }
      };
  
      chrome.storage.onChanged.addListener(handleStorageChange);
  
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }, []);
  
    useEffect(() => {
      if (!token) {
        setClient(null);
        return;
      }
  
      const tokenProvider = new OAuthTokenProvider({
        getTokenFn: () => Promise.resolve(token || null),
        refreshTokenFn: async (): Promise<string> => {
          return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              {
                action: "REFRESH_TOKEN",
                params: {
                  echoBaseUrl: apiUrl,
                  echoClientId: "3df07026-b25a-4797-93af-f35bdd3a7c86",
                },
              },
              (response) => {
                if (response.success && response.token) {
                  resolve(response.token);
                } else {
                  reject(new Error("Failed to refresh token"));
                }
              },
            );
          });
        },
        onRefreshErrorFn: (error) => {
          console.error("Error refreshing token:", error);
          setClient(null);
        },
      });
  
      const echoClient = new EchoClient({
        baseUrl: apiUrl,
        tokenProvider,
      });
  
      setClient(echoClient);
  
      return () => {
        setClient(null);
      };
    }, [token, apiUrl]);
  
    return client;
  }
  