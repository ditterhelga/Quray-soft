import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type SidebarContextValue = {
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const COLLAPSE_BREAKPOINT = 1280

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(
    () => window.innerWidth < COLLAPSE_BREAKPOINT,
  )
  // Tracks whether the current collapsed state was triggered automatically
  // by a resize event. Manual toggles clear this flag so that subsequent
  // resize events do not override the user's explicit choice.
  const autoCollapsedRef = useRef(window.innerWidth < COLLAPSE_BREAKPOINT)

  const onCollapsedChange = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed)
    autoCollapsedRef.current = false
  }, [])

  useEffect(() => {
    function handleResize() {
      const isNarrow = window.innerWidth < COLLAPSE_BREAKPOINT
      if (isNarrow && !autoCollapsedRef.current) {
        setIsCollapsed(true)
        autoCollapsedRef.current = true
      } else if (!isNarrow && autoCollapsedRef.current) {
        setIsCollapsed(false)
        autoCollapsedRef.current = false
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        onCollapsedChange,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }

  return context
}
