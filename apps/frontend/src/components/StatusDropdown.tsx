import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface StatusDropdownOption {
  value: string;
  label: string;
  triggerClass: string;
  dotClass: string;
}

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: StatusDropdownOption[];
  size?: "sm" | "md";
}

export default function StatusDropdown({
  value,
  onChange,
  options,
  size = "sm",
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number }>({
    top: 0,
    left: 0,
    minWidth: 0,
  });
  const [openUpwards, setOpenUpwards] = useState(false);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value]
  );

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const estimatedMenuHeight = Math.max((options.length * 42) + 16, 140);
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

  const sizeClass =
    size === "md"
      ? "pl-4 pr-10 py-2.5 text-sm whitespace-nowrap"
      : "pl-3 pr-9 py-2 text-xs whitespace-nowrap";

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`status-dropdown-trigger inline-flex w-full items-center justify-between rounded-xl border-2 font-semibold shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${sizeClass} ${selected.triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected.label}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.169l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="status-dropdown-menu fixed z-[200] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            style={{
              minWidth: `${menuStyle.minWidth}px`,
              left: `${menuStyle.left}px`,
              top: openUpwards ? `${menuStyle.top}px` : `${menuStyle.top}px`,
              transform: openUpwards ? "translateY(-100%)" : "none",
            }}
          >
            <ul role="listbox" className="py-1">
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      option.value === value
                        ? "bg-slate-100"
                        : "bg-white hover:bg-slate-50"
                    }`}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${option.dotClass}`} />
                    <span>{option.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}
