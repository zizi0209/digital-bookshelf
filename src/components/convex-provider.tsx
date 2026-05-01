"use client";

import { ConvexProvider as CP, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
    []
  );
  return <CP client={client}>{children}</CP>;
}
