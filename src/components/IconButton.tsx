import React from "react";
import type { LucideIcon } from "lucide-react";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  "aria-label": string;
}

export function IconButton({
  icon: Icon,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        background: "var(--color-surface)",
        color: "var(--color-ink-gray)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-fast) var(--easing-default)",
      }}
      {...props}
    >
      <Icon size={20} />
    </button>
  );
}
