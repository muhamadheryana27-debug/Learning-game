import type { ReactNode } from "react";
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-surface rounded-card shadow-md p-6 border border-muted ${className}`}>{children}</div>;
}
