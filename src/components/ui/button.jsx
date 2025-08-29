export function Button({ variant = "default", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm transition";
  const styles = variant === "outline"
    ? "border border-neutral-300 bg-white hover:bg-neutral-50"
    : "bg-neutral-900 text-white hover:bg-neutral-800";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
