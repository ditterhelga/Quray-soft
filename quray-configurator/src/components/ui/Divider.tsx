export function Divider() {
  return (
    <div
      role="separator"
      className="h-px w-full shrink-0"
      style={{
        background:
          'linear-gradient(90deg, color-mix(in srgb, var(--color-border-subtle) 25%, transparent), color-mix(in srgb, var(--color-border-subtle) 70%, transparent) 30%, color-mix(in srgb, var(--color-border-subtle) 70%, transparent) 70%, color-mix(in srgb, var(--color-border-subtle) 25%, transparent))',
      }}
    />
  )
}
