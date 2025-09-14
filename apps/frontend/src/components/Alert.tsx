import React from "react";

interface AlertProps {
  type?: "success" | "error" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
}

const typeStyles = {
  success: "bg-green-100 border-green-400 !text-green-800",
  error: "bg-red-100 border-red-400 !text-red-800",
  info: "bg-blue-100 border-blue-400 !text-blue-800",
  warning: "bg-yellow-100 border-yellow-400 !text-yellow-800",
};

const Alert = ({ type = "info", children, className = "" }: AlertProps) => (
  <div
    className={`border px-4 py-2 rounded mb-2 ${typeStyles[type]} ${className}`}
    role="alert"
    aria-live="polite"
  >
    {children}
  </div>
);

export default Alert;