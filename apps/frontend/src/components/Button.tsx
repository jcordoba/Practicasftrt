import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, variant = "primary", ...props }, ref) => {
    const base =
      "rounded px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed";
    const color =
      variant === "primary"
        ? "bg-blue-900 text-white hover:bg-blue-800"
        : "bg-gray-200 text-blue-900 hover:bg-gray-300";
    return (
      <button
        ref={ref}
        className={`${base} ${color} ${props.className ?? ""}`}
        aria-busy={loading}
        aria-disabled={props.disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="loader border-2 border-t-2 border-blue-200 border-t-blue-900 rounded-full w-4 h-4 animate-spin" />
            Cargando...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;