export function TextField({
  label,
  value,
  placeholder,
  autoFocus,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  autoFocus?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-border bg-input px-2 py-1.5 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none"
        autoFocus={autoFocus}
      />
    </label>
  )
}
