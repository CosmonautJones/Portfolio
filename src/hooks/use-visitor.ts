"use client";

import { use } from "react";
import { VisitorContext } from "@/lib/visitor-context";

/** Convenience hook for accessing visitor/progression context */
export function useVisitor() {
  return use(VisitorContext);
}
