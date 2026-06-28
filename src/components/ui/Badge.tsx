import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "lime";
}

export function Badge({ children, tone = "default" }: BadgeProps) {
  return <span className={`badge ${tone === "lime" ? "is-lime" : ""}`}>{children}</span>;
}
