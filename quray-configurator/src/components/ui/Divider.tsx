export function Divider() {
  return (
    <div
      role="separator"
      className="h-px w-full shrink-0"
      style={{
        background:
          'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-divider) 30%, transparent), transparent)',
      }}
    />
  )
}
