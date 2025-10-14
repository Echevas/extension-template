import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const MeritLogo: React.FC<Props> = ({ className }) => {
  return (
    <>
      <img
        src="/merit.svg"
        alt="Merit"
        width={100}
        height={100}
        className={cn(className)}
      />
    </>
  );
};
