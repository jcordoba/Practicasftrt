import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="font-medium !text-slate-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`border rounded px-3 py-2 !text-slate-900 placeholder:!text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : ""
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="!text-red-600 text-xs">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;