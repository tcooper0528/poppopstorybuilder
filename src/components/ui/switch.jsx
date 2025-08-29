import React from "react";
export function Switch({ checked = false, onCheckedChange, className = "" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${checked ? "bg-neutral-900" : "bg-neutral-300"} ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
