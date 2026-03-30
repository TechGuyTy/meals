import { useMemo, useState } from 'react'
import { catalog } from '../data/catalog'

type Props = {
  onBack: () => void
  onPick: (sectionId: string, label: string) => void
  hasOnList: (label: string) => boolean
}

function initialExpanded(): Record<string, boolean> {
  return Object.fromEntries(catalog.map((s) => [s.id, true]))
}

export function StockSheet({ onBack, onPick, hasOnList }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded)

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const sectionCount = catalog.length

  const heading = useMemo(
    () => (
      <header className="sticky top-0 z-10 border-b border-border bg-bg px-4 py-4">
        <p className="font-mono text-xs tracking-wide text-muted uppercase">
          Stock sheet · {sectionCount} sections
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-text">
            Add from list
          </h1>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 font-sans text-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back
          </button>
        </div>
        <p className="mt-3 font-mono text-xs leading-snug text-muted">
          Tap a line to toggle it on your list. Collapse a section if you do not
          need it this trip.
        </p>
      </header>
    ),
    [sectionCount],
  )

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {heading}

      <div className="flex-1 px-4 pb-10">
        {catalog.map((section) => {
          const isOpen = expanded[section.id] !== false
          return (
            <section key={section.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="flex w-full items-start gap-2 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-expanded={isOpen}
                aria-controls={`section-${section.id}`}
              >
                <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">
                  {isOpen ? '[−]' : '[+]'}
                </span>
                <h2 className="font-sans text-base font-semibold tracking-tight text-text">
                  {section.title}
                </h2>
              </button>

              {isOpen && (
                <ul id={`section-${section.id}`} className="pb-2">
                  {section.items.map((label, i) => {
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
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
