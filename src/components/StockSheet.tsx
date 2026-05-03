import { useEffect, useRef, useState } from 'react'
import type { CatalogSection } from '../data/catalog'

type Props = {
  catalog: CatalogSection[]
  onBack: () => void
  onPick: (sectionId: string, label: string) => void
  hasOnList: (label: string) => boolean
  onAddCatalogItem: (sectionId: string, label: string) => void
  onRemoveCatalogItem: (sectionId: string, label: string) => void
  onRenameCatalogItem: (sectionId: string, oldLabel: string, newLabel: string) => void
  onAddSection: (title: string) => void
  onDeleteSection: (sectionId: string) => void
  onRenameSection: (sectionId: string, newTitle: string) => void
}

/** Auto-focusing input that commits on Enter/blur and cancels on Escape. */
function InlineInput({
  defaultValue,
  placeholder,
  onCommit,
  onCancel,
  className,
}: {
  defaultValue: string
  placeholder?: string
  onCommit: (value: string) => void
  onCancel: () => void
  className?: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <input
      ref={ref}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') { e.preventDefault(); onCancel() }
      }}
      className={className}
    />
  )
}

export function StockSheet({
  catalog,
  onBack,
  onPick,
  hasOnList,
  onAddCatalogItem,
  onRemoveCatalogItem,
  onRenameCatalogItem,
  onAddSection,
  onDeleteSection,
  onRenameSection,
}: Props) {
  const [editMode, setEditMode] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Inline editing state — one active at a time
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null)
  const [renamingItem, setRenamingItem] = useState<{ sectionId: string; label: string } | null>(null)
  const [addingItemToSection, setAddingItemToSection] = useState<string | null>(null)
  const [addingSection, setAddingSection] = useState(false)

  const isOpen = (id: string) => expanded[id] !== false

  const toggleSection = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !isOpen(id) }))
  }

  const clearEditState = () => {
    setRenamingSectionId(null)
    setRenamingItem(null)
    setAddingItemToSection(null)
    setAddingSection(false)
  }

  const handleToggleEditMode = () => {
    clearEditState()
    setEditMode((prev) => !prev)
  }

  const sectionCount = catalog.length

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg px-4 py-4">
        <p className="font-mono text-xs tracking-wide text-muted uppercase">
          Stock sheet · {sectionCount} section{sectionCount !== 1 ? 's' : ''}
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-text">
            {editMode ? 'Edit catalog' : 'Add from list'}
          </h1>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleToggleEditMode}
              className={`font-sans text-sm font-medium underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                editMode ? 'text-accent' : 'text-muted'
              }`}
            >
              {editMode ? 'Done' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="font-sans text-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Back
            </button>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs leading-snug text-muted">
          {editMode
            ? 'Tap a section or item name to rename. Use [×] to delete.'
            : 'Tap a line to toggle it on your list. Collapse a section if you do not need it this trip.'}
        </p>
      </header>

      <div className="flex-1 px-4 pb-10">
        {catalog.map((section) => {
          const open = isOpen(section.id)
          return (
            <section key={section.id} className="border-b border-border last:border-b-0">
              {/* Section header */}
              {editMode ? (
                <div className="flex w-full items-center gap-2 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    aria-expanded={open}
                  >
                    <span className="font-mono text-xs text-accent">
                      {open ? '[−]' : '[+]'}
                    </span>
                  </button>

                  {renamingSectionId === section.id ? (
                    <InlineInput
                      defaultValue={section.title}
                      onCommit={(val) => {
                        onRenameSection(section.id, val)
                        setRenamingSectionId(null)
                      }}
                      onCancel={() => setRenamingSectionId(null)}
                      className="min-w-0 flex-1 bg-transparent font-sans text-base font-semibold tracking-tight text-text outline-none border-b border-accent focus:border-accent"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { clearEditState(); setRenamingSectionId(section.id) }}
                      className="min-w-0 flex-1 text-left font-sans text-base font-semibold tracking-tight text-text hover:text-accent focus-visible:outline-none"
                    >
                      {section.title}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { clearEditState(); onDeleteSection(section.id) }}
                    className="ml-1 shrink-0 font-mono text-xs text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    aria-label={`Delete ${section.title}`}
                  >
                    [×]
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-start gap-2 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-expanded={open}
                  aria-controls={`section-${section.id}`}
                >
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">
                    {open ? '[−]' : '[+]'}
                  </span>
                  <h2 className="font-sans text-base font-semibold tracking-tight text-text">
                    {section.title}
                  </h2>
                </button>
              )}

              {/* Section items */}
              {open && (
                <ul id={`section-${section.id}`} className="pb-2">
                  {section.items.map((label, i) => {
                    const isRenamingThis =
                      renamingItem?.sectionId === section.id &&
                      renamingItem.label === label

                    if (editMode) {
                      return (
                        <li key={label}>
                          <div
                            className={`flex w-full items-center gap-3 border-t border-border py-2 pl-7 ${
                              i % 2 === 1 ? 'bg-surface/40' : ''
                            }`}
                          >
                            {isRenamingThis ? (
                              <InlineInput
                                defaultValue={label}
                                onCommit={(val) => {
                                  onRenameCatalogItem(section.id, label, val)
                                  setRenamingItem(null)
                                }}
                                onCancel={() => setRenamingItem(null)}
                                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text outline-none border-b border-accent"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => { clearEditState(); setRenamingItem({ sectionId: section.id, label }) }}
                                className="min-w-0 flex-1 text-left font-mono text-sm text-text hover:text-accent focus-visible:outline-none"
                              >
                                {label}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => { clearEditState(); onRemoveCatalogItem(section.id, label) }}
                              className="shrink-0 font-mono text-xs text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                              aria-label={`Delete ${label}`}
                            >
                              [×]
                            </button>
                          </div>
                        </li>
                      )
                    }

                    // Normal (non-edit) mode
                    const onList = hasOnList(label)
                    return (
                      <li key={label}>
                        <button
                          type="button"
                          onClick={() => onPick(section.id, label)}
                          className={`flex w-full items-center justify-between gap-3 border-t border-border py-2 pl-7 text-left font-mono text-sm transition-colors focus-visible:outline-none ${
                            i % 2 === 1 ? 'bg-surface/40' : ''
                          } ${
                            onList
                              ? 'text-muted line-through hover:bg-surface/70 active:bg-surface'
                              : 'text-text hover:bg-surface/70 active:bg-surface'
                          }`}
                        >
                          <span className="min-w-0">{label}</span>
                          {onList ? (
                            <span className="shrink-0 font-sans text-xs text-muted">
                              remove
                            </span>
                          ) : (
                            <span className="shrink-0 font-sans text-xs text-accent">
                              add
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}

                  {/* Add item row (edit mode only) */}
                  {editMode && (
                    <li>
                      {addingItemToSection === section.id ? (
                        <div className="flex items-center border-t border-border py-2 pl-7">
                          <InlineInput
                            defaultValue=""
                            placeholder="New item…"
                            onCommit={(val) => {
                              if (val.trim()) onAddCatalogItem(section.id, val)
                              setAddingItemToSection(null)
                            }}
                            onCancel={() => setAddingItemToSection(null)}
                            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text placeholder:text-muted/50 outline-none"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { clearEditState(); setAddingItemToSection(section.id) }}
                          className="flex w-full items-center gap-2 border-t border-border py-2 pl-7 font-mono text-xs text-muted hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          + add item
                        </button>
                      )}
                    </li>
                  )}
                </ul>
              )}
            </section>
          )
        })}

        {/* New category row (edit mode only) */}
        {editMode && (
          <div className="mt-4">
            {addingSection ? (
              <div className="flex items-center py-3">
                <InlineInput
                  defaultValue=""
                  placeholder="New category…"
                  onCommit={(val) => {
                    if (val.trim()) onAddSection(val)
                    setAddingSection(false)
                  }}
                  onCancel={() => setAddingSection(false)}
                  className="min-w-0 flex-1 bg-transparent font-sans text-base font-semibold tracking-tight text-text placeholder:text-muted/50 outline-none border-b border-accent"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { clearEditState(); setAddingSection(true) }}
                className="font-mono text-xs text-muted hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                + new category
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
