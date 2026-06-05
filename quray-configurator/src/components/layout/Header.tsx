import { Divider } from '@/components/ui/Divider'
import { StatusPill } from '@/components/ui/StatusPill'

export function Header() {
  return (
    <header className="flex shrink-0 flex-col">
      <div className="flex items-center justify-end py-5 pr-8">
        <div className="flex items-center gap-5">
          <StatusPill label="Connected" status="positive" menu="connected" />
          <StatusPill label="Calibrated" status="positive" menu="calibrated" />
        </div>
      </div>
      <Divider />
    </header>
  )
}
