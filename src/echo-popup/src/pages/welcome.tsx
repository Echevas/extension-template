import React from "react";
import { EchoSignin } from "@/components/ui/echo-sign-in";
import { useEcho } from "@/hooks/useEcho";

export const WelcomePage: React.FC = () => {
  const { isAuthenticated } = useEcho();

  return (
    
    <div className="flex flex-col h-full w-full items-center justify-center gap-4">
      {isAuthenticated ? <div>Signed in</div> : <EchoSignin className="w-32 h-12 mb-4" />}
    </div>
  );
};