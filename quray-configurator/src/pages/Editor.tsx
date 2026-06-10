import { useSearchParams } from 'react-router-dom'

export function Editor() {
  const [searchParams] = useSearchParams()
  const presetId = searchParams.get('presetId')

  return <div className="flex h-screen w-full" />
}
