"use client";

import { Provider } from "jotai";
import { ReactElement } from "react";

interface JotaiProvider {
  children: ReactElement;
}

export default function JotaiProvider({ children, ...props }: JotaiProvider) {
  return <Provider {...props}>{children}</Provider>;
}
