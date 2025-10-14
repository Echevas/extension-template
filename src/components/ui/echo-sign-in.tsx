import { useEcho } from "@/hooks/useEcho";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { MeritLogo } from "@/components/ui/merit-logo";

interface EchoSigninProps {
  className?: string;
}

export const EchoSignin: React.FC<EchoSigninProps> = ({ className }) => {
  const { isAuthenticated, isLoading, signIn, signOut } = useEcho();

  const [isHovered, setIsHovered] = useState(false);

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut();
    } else {
      await signIn();
    }
  };

  return (
    <Button
      className={className}
      onClick={handleAuthAction}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        backgroundColor: isLoading
          ? "#f3f4f6"
          : isHovered
            ? "#f1f5f9"
            : "#ffffff",
        color: isLoading ? "#9ca3af" : "#09090b",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: "800",
        fontFamily: "HelveticaNowDisplay, sans-serif",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MeritLogo className="w-8 h-8" />
      {isAuthenticated ? null : <p>Sign In</p>}
    </Button>
  );
};
