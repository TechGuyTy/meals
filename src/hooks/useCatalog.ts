import { useCallback, useEffect, useState } from 'react'
import { defaultCatalog, type CatalogSection } from '../data/catalog'

const CATALOG_KEY = 'happyjoy-catalog'

function norm(label: string) {
  return label.trim().toLowerCase()
}

function validateCatalog(x: unknown): CatalogSection[] | null {
  if (!Array.isArray(x)) return null
  const sections: CatalogSection[] = []
  for (const s of x) {
    if (
      s === null ||
      typeof s !== 'object' ||
      typeof (s as Record<string, unknown>).id !== 'string' ||
      typeof (s as Record<string, unknown>).title !== 'string' ||
      !Array.isArray((s as Record<string, unknown>).items)
    )
      return null
    sections.push({
      id: (s as CatalogSection).id,
      title: (s as CatalogSection).title,
      items: ((s as CatalogSection).items as unknown[]).filter(
        (i): i is string => typeof i === 'string',
      ),
    })
  }
  return sections
}

function loadCatalog(): CatalogSection[] {
  try {
    const raw = localStorage.getItem(CATALOG_KEY)
    if (!raw) return defaultCatalog.map((s) => ({ ...s, items: [...s.items] }))
    const parsed: unknown = JSON.parse(raw)
    return (
      validateCatalog(parsed) ??
      defaultCatalog.map((s) => ({ ...s, items: [...s.items] }))
    )
  } catch {
    return defaultCatalog.map((s) => ({ ...s, items: [...s.items] }))
  }
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogSection[]>(loadCatalog)

  useEffect(() => {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog))
  }, [catalog])

  const addItem = useCallback((sectionId: string, label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    setCatalog((prev) =>
      prev.map((s) =>
        s.id !== sectionId || s.items.some((i) => norm(i) === norm(trimmed))
          ? s
          : { ...s, items: [...s.items, trimmed] },
      ),
    )
  }, [])

  const removeItem = useCallback((sectionId: string, label: string) => {
    setCatalog((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, items: s.items.filter((i) => norm(i) !== norm(label)) },
      ),
    )
  }, [])

  const renameItem = useCallback(
    (sectionId: string, oldLabel: string, newLabel: string) => {
      const trimmed = newLabel.trim()
      if (!trimmed || norm(trimmed) === norm(oldLabel)) return
      setCatalog((prev) =>
        prev.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                items: s.items.map((i) =>
                  norm(i) === norm(oldLabel) ? trimmed : i,
                ),
              },
        ),
      )
    },
    [],
  )

  const addSection = useCallback((title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setCatalog((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: trimmed, items: [] },
    ])
  }, [])

  const removeSection = useCallback((sectionId: string) => {
    setCatalog((prev) => prev.filter((s) => s.id !== sectionId))
  }, [])

  const renameSection = useCallback((sectionId: string, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    setCatalog((prev) =>
      prev.map((s) => (s.id !== sectionId ? s : { ...s, title: trimmed })),
    )
  }, [])

  return {
    catalog,
    addItem,
    removeItem,
    renameItem,
    addSection,
    removeSection,
    renameSection,
  }
}
