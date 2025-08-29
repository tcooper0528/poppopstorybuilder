export function Label({ className = "", children, ...props }) {
  return <label className={`text-sm font-medium ${className}`} {...props}>{children}</label>;
}
