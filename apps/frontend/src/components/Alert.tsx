import React from "react";

interface AlertProps {
  type?: "success" | "error" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
}

const typeStyles = {
  success: "bg-green-500 border-green-600 !text-white",
  error: "bg-red-500 border-red-500 !text-white",
  info: "bg-blue-500 border-blue-400 !text-white",
  warning: "bg-red-100 border-yellow-400 !text-white",
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