import React, { useState, useEffect, useCallback } from "react";
import { EchoContext, type EchoContextValue } from "@/hooks/useEcho";
import type { EchoUser, EchoBalance } from "@/types/echo";
import { useEchoClient } from "@/hooks/useEchoClient";
import { useEchoPayments } from "@/hooks/useEchoPayments";

interface EchoProviderProps {
  children: React.ReactNode;
}

// Helper function to check if user is authenticated
const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  user: EchoUser | null;
  token: string | null;
}> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "CHECK_AUTH" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve({
        isAuthenticated: response.isAuthenticated,
        user: response.user,
        token: response.token || null,
      });
    });
  });
};

export const EchoProvider: React.FC<EchoProviderProps> = ({ children }) => {
  const [user, setUser] = useState<EchoUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState<EchoBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Function to update auth state
  const updateAuthState = async () => {
    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
      setToken(authStatus.token);
      setError(null);
    } catch (error) {
      console.error("Error updating auth state:", error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check initial authentication state on mount
  useEffect(() => {
    updateAuthState();
  }, []);

  // Listen for storage changes to update auth state
  useEffect(() => {
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      const authKeys = [
        "echo_user",
        "echo_access_token",
        "echo_access_token_expires_at",
      ];
      const hasAuthChanges = authKeys.some((key) => changes[key]);

      if (hasAuthChanges) {
        updateAuthState();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const signIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Authentication is handled by the background script
      const response = await new Promise<{
        success: boolean;
        echoUser?: EchoUser;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "AUTHENTICATE",
            params: {
              echoClientId: import.meta.env.VITE_ECHO_CLIENT_ID,
              echoBaseUrl: import.meta.env.VITE_ECHO_BASE_URL,
            },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(response);
          },
        );
      });

      if (response.success && response.echoUser) {
        // Update auth state after successful authentication
        await updateAuthState();
      } else {
        throw new Error(response.error || "Authentication failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      // Clear authentication from background script
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "SIGN_OUT" }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      });

      // Update auth state after sign out
      await updateAuthState();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const echoClient = useEchoClient({ apiUrl: import.meta.env.VITE_ECHO_BASE_URL });

  const refreshBalance = useCallback(async () => {
    const balance = await echoClient?.balance.getBalance();
    if (balance) {
      const echoBalance: EchoBalance = {
        totalPaid: balance.totalPaid,
        totalSpent: balance.totalSpent,
        balance: balance.balance,
        currency: "USD", // Balance from SDK doesn't include currency, defaulting to USD
      };
      setBalance(echoBalance);
    } else {
      setBalance(null);
    }
  }, [echoClient]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const { createPaymentLink } = useEchoPayments(echoClient);

  // TODO: update getBalance
  const freeTierBalance = null;

  const getToken = async (): Promise<string | null> => {
    try {
      const response = await new Promise<{ token: string | null }>(
        (resolve, reject) => {
          chrome.runtime.sendMessage(
            {
              action: "GET_TOKEN",
              params: {
                echoBaseUrl: import.meta.env.VITE_ECHO_BASE_URL,
                echoClientId: import.meta.env.VITE_ECHO_CLIENT_ID,
              },
            },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve(response);
            },
          );
        },
      );
      return response.token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const clearAuth = async (): Promise<void> => {
    // TODO: Implement clear auth
  };

  const contextValue: EchoContextValue = {
    user,
    balance,
    isAuthenticated,
    isLoading,
    error,
    token,
    freeTierBalance,
    echoClient,
    signIn,
    signOut,
    refreshBalance,
    createPaymentLink,
    getToken,
    clearAuth,
  };
  return (
    <EchoContext.Provider value={contextValue}>{children}</EchoContext.Provider>
  );
};
