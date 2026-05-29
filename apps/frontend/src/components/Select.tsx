import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  id,
  options,
  className,
  value,
  onChange,
  disabled,
  name,
  required,
  ...props
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number }>({
    top: 0,
    left: 0,
    minWidth: 0,
  });
  const [openUpwards, setOpenUpwards] = useState(false);

  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const selected = useMemo(() => {
    const strValue = String(value ?? "");
    return options.find((opt) => String(opt.value) === strValue) ?? options[0];
  }, [options, value]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const estimatedMenuHeight = Math.max(options.length * 42 + 16, 120);
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenUp = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

      setOpenUpwards(shouldOpenUp);
      setMenuStyle({
        top: shouldOpenUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        minWidth: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const triggerClass = `app-select-trigger border border-slate-300 rounded-xl px-3 py-2 w-full text-left flex items-center justify-between !text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
    error ? "border-red-500" : ""
  } ${className || ""}`;

  const handleSelect = (newValue: string) => {
    const syntheticEvent = {
      target: { value: newValue, name: name || "" },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange?.(syntheticEvent);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 w-full" ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="font-medium text-blue-900">
          {label}
        </label>
      )}

      <button
        id={selectId}
        type="button"
        disabled={disabled}
        className={`${triggerClass} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span className="truncate">{selected?.label ?? "Seleccionar"}</span>
        <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.169l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {required && name ? <input type="hidden" name={name} value={String(value ?? "")} /> : null}

      {open && typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="app-select-menu fixed z-[220] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            style={{
              minWidth: `${menuStyle.minWidth}px`,
              left: `${menuStyle.left}px`,
              top: `${menuStyle.top}px`,
              transform: openUpwards ? "translateY(-100%)" : "none",
            }}
          >
            <ul role="listbox" className="py-1 max-h-72 overflow-auto">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={`w-full px-3 py-2.5 text-left text-sm !text-slate-900 transition-colors ${String(opt.value) === String(value) ? "bg-slate-100" : "hover:bg-slate-50"}`}
                    onClick={() => handleSelect(opt.value)}
                    role="option"
                    aria-selected={String(opt.value) === String(value)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}

      {error && (
        <span id={`${selectId}-error`} className="text-red-600 text-xs">
          {error}
        </span>
      )}
    </div>
  );
}