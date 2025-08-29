import React from "react";

function collectOptions(children) {
  const opts = [];
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type && (child.type.displayName === "SelectContent")) {
      React.Children.forEach(child.props.children, (c) => {
        if (!c) return;
        if (c.type && (c.type.displayName === "SelectItem")) {
          opts.push({ value: c.props.value, label: c.props.children });
        }
      });
    }
  });
  return opts;
}

export function Select({ value, onValueChange, children }) {
  const options = collectOptions(children);
  return (
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function SelectTrigger({ className = "", children }) {
  return null; // native select handles trigger
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectContent({ className = "", children }) {
  return <>{children}</>; // used only for options collection
}
SelectContent.displayName = "SelectContent";

export function SelectItem({ value, children }) {
  return null; // rendered as <option> by Select
}
SelectItem.displayName = "SelectItem";

export function SelectValue() {
  return null; // native select shows value
}
SelectValue.displayName = "SelectValue";
