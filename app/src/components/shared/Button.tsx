import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`bg-primary text-white rounded-card px-6 py-3 min-h-[48px] font-semibold hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}
export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`bg-surface border-2 border-primary text-primary rounded-card px-6 py-3 min-h-[48px] font-semibold hover:bg-muted transition ${className}`}
      {...props}
    />
  );
}
