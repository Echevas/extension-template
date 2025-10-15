import React from "react";
import { useEcho } from "@/hooks/useEcho";
import { EchoAccountButton } from "@/components/echo-account";

export const WelcomePage: React.FC = () => {
  const echo = useEcho();
  const { isAuthenticated } = echo;
  
  if (!isAuthenticated) {
    // Not signed in: centered layout
    return (
      <div className="flex flex-col h-full w-full items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Echo Extension Template</h1>
        <EchoAccountButton echo={echo} />
      </div>
    );
  }

  // Signed in: header with content below
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Echo Extension Template</h1>
        <EchoAccountButton echo={echo} />
      </div>
      
      {/* Content section */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">How to use this extension</h2>
          <p className="text-gray-700">
            Welcome to Echo Extension Template! This extension provides seamless authentication 
            for accessing AI resources like OpenAI, Anthropic, and more through the Echo platform.
          </p>
          <div className="space-y-2">
            <h3 className="font-medium">Getting Started</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Access AI models directly from your browser</li>
              <li>Secure authentication through Echo</li>
              <li>Manage your account and billing easily</li>
              <li>Build powerful AI-powered browser extensions</li>
            </ul>
          </div>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  );
};