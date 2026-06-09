import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  type = "submit",
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    padding: "12px 24px",
    borderRadius: "var(--radius-md)",
    border: "none",
    fontFamily: "var(--font-body)",
    fontSize: "16px",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "background var(--duration-fast) var(--easing-default)",
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: "var(--color-warm-candle)",
      color: "var(--color-night-paper)",
    },
    secondary: {
      background: "var(--color-surface)",
      color: "var(--color-ink-gray)",
      border: "1px solid var(--color-quiet-border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-ink-gray)",
    },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      {...props}
    >
      {children}
    </button>
  );
}
