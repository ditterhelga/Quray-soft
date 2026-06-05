import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Library } from './pages/Library'
import { Device } from './pages/Device'
import { Editor } from './pages/Editor'
import { Explore } from './pages/Explore'
import { Styleguide } from './pages/Styleguide'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="styleguide" element={<Styleguide />} />
        <Route element={<AppShell />}>
          <Route index element={<Library />} />
          <Route path="device" element={<Device />} />
          <Route path="editor" element={<Editor />} />
          <Route path="explore" element={<Explore />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
