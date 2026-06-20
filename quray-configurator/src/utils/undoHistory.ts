/**
 * undoHistory.ts
 *
 * Generic, content-agnostic undo/redo stack implemented with the command
 * pattern. It stores `undo`/`redo` closures only — it knows nothing about
 * zones, selection, or any domain state. Callers (the editor context) build
 * commands that restore the `zones` content snapshot on undo/redo.
 *
 * Design notes
 * ------------
 *  • Commands are NOT full app-state snapshots. The editor pushes commands
 *    whose closures restore only the `zones` array; UI state such as
 *    selectedZoneId is reconciled by the caller after each undo/redo, never
 *    stored here.
 *  • `past` holds applied commands (most recent last). `redo` replays from
 *    `future` (next-to-redo first). Pushing a new command clears `future`.
 *  • The stack is bounded to `maxSize`; the oldest command is dropped when the
 *    limit is exceeded.
 */

import { useCallback, useRef, useState } from 'react'

export type HistoryCommand = {
  undo: () => void
  redo: () => void
  description?: string
}

export type UseUndoHistory = {
  /** Add a command and clear the redo stack. Does NOT call redo(). */
  push: (command: HistoryCommand) => void
  /** Run the most recent command's undo() and move it to the redo stack. */
  undo: () => void
  /** Run the next command's redo() and move it back to the undo stack. */
  redo: () => void
  /** Drop all history (e.g. when switching presets). */
  clear: () => void
  replaceLast: (command: HistoryCommand) => void
  canUndo: boolean
  canRedo: boolean
}

const DEFAULT_MAX_SIZE = 100

export function useUndoHistory(maxSize: number = DEFAULT_MAX_SIZE): UseUndoHistory {
  // The stacks live in refs so push/undo/redo are stable and never go stale.
  // `canUndo`/`canRedo` are mirrored into state so consumers re-render when
  // the availability of undo/redo changes (e.g. to toggle button `disabled`).
  const pastRef = useRef<HistoryCommand[]>([])
  const futureRef = useRef<HistoryCommand[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const syncFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0)
    setCanRedo(futureRef.current.length > 0)
  }, [])

  const push = useCallback(
    (command: HistoryCommand) => {
      pastRef.current.push(command)
      if (pastRef.current.length > maxSize) {
        pastRef.current.shift()
      }
      // Any new action invalidates the redo branch.
      futureRef.current = []
      syncFlags()
    },
    [maxSize, syncFlags],
  )

  const undo = useCallback(() => {
    const command = pastRef.current.pop()
    if (!command) {
      return
    }

    command.undo()
    futureRef.current.unshift(command)
    syncFlags()
  }, [syncFlags])

  const redo = useCallback(() => {
    const command = futureRef.current.shift()
    if (!command) {
      return
    }

    command.redo()
    pastRef.current.push(command)
    syncFlags()
  }, [syncFlags])

  const clear = useCallback(() => {
    pastRef.current = []
    futureRef.current = []
    syncFlags()
  }, [syncFlags])

  const replaceLast = useCallback((command: HistoryCommand) => {
    if (pastRef.current.length === 0) return
    pastRef.current[pastRef.current.length - 1] = command
  }, [])

  return { push, undo, redo, clear, replaceLast, canUndo, canRedo }
}
