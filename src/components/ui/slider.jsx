export function Slider({ value = [50], onValueChange, max = 100, step = 1, className = "" }) {
  const val = Array.isArray(value) ? value[0] : value ?? 0;
  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={val}
      onChange={(e) => onValueChange && onValueChange([Number(e.target.value)])}
      className={`w-full ${className}`}
    />
  );
}
