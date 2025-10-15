import {
    createEchoAnthropic,
    createEchoGoogle,
    createEchoOpenAI,
  } from "@merit-systems/echo-typescript-sdk";
  import { useMemo } from "react";
  import { useEcho } from "./useEcho";
  
  export const useEchoModelProviders = () => {
    const { getToken } = useEcho();
  
    return useMemo(() => {
      const baseConfig = {
        appId: import.meta.env.VITE_ECHO_CLIENT_ID,
        baseRouterUrl: import.meta.env.VITE_ECHO_ROUTER_BASE_URL,
      };
  
      return {
        openai: createEchoOpenAI(baseConfig, getToken),
        anthropic: createEchoAnthropic(baseConfig, getToken),
        google: createEchoGoogle(baseConfig, getToken),
      };
    }, [getToken]);
  };