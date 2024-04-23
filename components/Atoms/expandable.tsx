"use client";

import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import type { ReactElement } from "react";
import type { PrimitiveAtom } from "jotai";

interface ExpandableProps {
  children: ReactElement;
  atom: PrimitiveAtom<boolean>;
}
export default function Expandable({ atom, children }: ExpandableProps) {
  const [isExpanded] = useAtom(atom);

  return (
    <div className={cn("duration-500", isExpanded && "ml-[300px]")}>
      {children}
    </div>
  );
}
