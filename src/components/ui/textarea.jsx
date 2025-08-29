export function Textarea({ className = "", ...props }) {
  return <textarea className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400 ${className}`} {...props} />;
}
