export function formatRelativeTime(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return 'Today'
  }

  if (diffDays === 1) {
    return '1d ago'
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  const diffWeeks = Math.floor(diffDays / 7)

  if (diffWeeks < 5) {
    return `${diffWeeks}w ago`
  }

  const diffMonths = Math.floor(diffDays / 30)

  if (diffMonths < 12) {
    return `${diffMonths}mo ago`
  }

  const diffYears = Math.floor(diffDays / 365)

  return `${diffYears}y ago`
}
