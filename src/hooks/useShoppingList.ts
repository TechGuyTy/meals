import { useCallback, useEffect, useState } from 'react'
import { resolveSectionIdForLabel, type ListItemWithSection } from '../data/catalog'

const STORAGE_KEY = 'happyjoy-groceries'

export type ListItem = ListItemWithSection

function normalize(label: string): string {
  return label.trim().toLowerCase()
}

function migrateRow(x: unknown): ListItem | null {
  if (x === null || typeof x !== 'object' || !('id' in x) || !('label' in x))
    return null
  const id = (x as { id: unknown }).id
  const label = (x as { label: unknown }).label
  if (typeof id !== 'string' || typeof label !== 'string') return null

  const raw = x as { sectionId?: unknown }
  const sectionId =
    typeof raw.sectionId === 'string'
      ? raw.sectionId
      : resolveSectionIdForLabel(label)

  return { id, label, sectionId }
}

function load(): ListItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(migrateRow)
      .filter((x): x is ListItem => x !== null)
  } catch {
    return []
  }
}

export function useShoppingList() {
  const [items, setItems] = useState<ListItem[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((sectionId: string, label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    const norm = normalize(trimmed)
    setItems((prev) => {
      if (prev.some((i) => normalize(i.label) === norm)) return prev
      return [
        ...prev,
        { id: crypto.randomUUID(), label: trimmed, sectionId },
      ]
    })
  }, [])

  const toggleItemByLabel = useCallback((sectionId: string, label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    const norm = normalize(trimmed)
    setItems((prev) => {
      const existing = prev.find((i) => normalize(i.label) === norm)
      if (existing) return prev.filter((i) => i.id !== existing.id)
      return [
        ...prev,
        { id: crypto.randomUUID(), label: trimmed, sectionId },
      ]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const hasLabel = useCallback(
    (label: string) => items.some((i) => normalize(i.label) === normalize(label)),
    [items],
  )

  return { items, addItem, toggleItemByLabel, removeItem, hasLabel }
}
