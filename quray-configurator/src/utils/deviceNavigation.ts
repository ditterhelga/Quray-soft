const LIBRARY_SET_FOCUS_KEY = 'quray:library-focus-set'

export function focusLibrarySet(setId: string) {
  sessionStorage.setItem(LIBRARY_SET_FOCUS_KEY, setId)
}

export function consumeLibrarySetFocus(): string | null {
  const setId = sessionStorage.getItem(LIBRARY_SET_FOCUS_KEY)
  if (!setId) {
    return null
  }

  sessionStorage.removeItem(LIBRARY_SET_FOCUS_KEY)
  return setId
}
