import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { DeviceProvider } from '@/context/DeviceContext'
import { PresetsProvider } from '@/context/PresetsContext'
import { AppShell } from './components/layout/AppShell'
import { Library } from './pages/Library'
import { Device } from './pages/Device'
import { Editor } from './pages/Editor'
import { Explore } from './pages/Explore'
import { Styleguide } from './pages/Styleguide'

function FullLibrary() {
  return <Library mode="full" />
}

export function App() {
  return (
    <PresetsProvider>
    <DeviceProvider>
    <BrowserRouter>
      <Routes>
        <Route path="styleguide" element={<Styleguide />} />
        <Route element={<AppShell />}>
          <Route index element={<Library mode="fresh" />} />
          <Route path="full" element={<FullLibrary />} />
          <Route path="device" element={<Device />} />
          <Route path="explore" element={<Explore />} />
          <Route path="editor" element={<Navigate to="/editor/preset-empty" replace />} />
          <Route path="editor/:presetId" element={<Editor />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </DeviceProvider>
    </PresetsProvider>
  )
}
