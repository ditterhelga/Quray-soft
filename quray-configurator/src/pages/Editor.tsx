import { useSearchParams } from 'react-router-dom'

export function Editor() {
  const [searchParams] = useSearchParams()
  const presetId = searchParams.get('presetId')

  return (
    <div>
      <p>Editor — coming soon{presetId ? ` (preset: ${presetId})` : ''}</p>
    </div>
  )
}
