import React, { createContext, useContext, useState } from "react";

const TabsCtx = createContext({ value: "", setValue: (v) => {} });

export function Tabs({ defaultValue, value: controlled, onValueChange, children, className = "" }) {
  const [internal, setInternal] = useState(defaultValue || "");
  const value = controlled ?? internal;
  const setValue = (v) => {
    setInternal(v);
    onValueChange && onValueChange(v);
  };
  return (
    <TabsCtx.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return <div className={`mb-3 grid gap-2 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children }) {
  const ctx = useContext(TabsCtx);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={`rounded-lg border px-3 py-2 text-sm ${active ? "bg-neutral-900 text-white" : "bg-white"}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  const ctx = useContext(TabsCtx);
  if (ctx.value !== value) return null;
  return <div>{children}</div>;
}
