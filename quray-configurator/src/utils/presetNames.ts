export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function nextUntitledName(existingNames: Set<string>) {
  let index = 1

  while (existingNames.has(`Untitled ${index}`)) {
    index += 1
  }

  return `Untitled ${index}`
}

export function duplicatePresetName(originalName: string, existingNames: Set<string>) {
  const firstCandidate = `Copy of ${originalName}`

  if (!existingNames.has(firstCandidate)) {
    return firstCandidate
  }

  let index = 2

  while (existingNames.has(`Copy of ${originalName} ${index}`)) {
    index += 1
  }

  return `Copy of ${originalName} ${index}`
}

export type ResolvePresetNameResult = {
  name: string
  renamedDueToDuplicate: boolean
}

export function resolvePresetName(
  rawName: string,
  existingNames: Set<string>,
): ResolvePresetNameResult {
  const trimmed = rawName.trim()

  if (!trimmed) {
    return { name: nextUntitledName(existingNames), renamedDueToDuplicate: false }
  }

  if (!existingNames.has(trimmed)) {
    return { name: trimmed, renamedDueToDuplicate: false }
  }

  let index = 2
  let candidate = `${trimmed} ${index}`

  while (existingNames.has(candidate)) {
    index += 1
    candidate = `${trimmed} ${index}`
  }

  return { name: candidate, renamedDueToDuplicate: true }
}

export function duplicateNameToastMessage(name: string) {
  return `A preset with this name already exists — renamed to ${name}.`
}
