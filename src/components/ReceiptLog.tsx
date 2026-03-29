import { layoutShoppingListForHome } from '../data/catalog'
import type { ListItem } from '../hooks/useShoppingList'

type Props = {
  items: ListItem[]
  onRemove: (id: string) => void
  onAddItems: () => void
}

export function ReceiptLog({ items, onRemove, onAddItems }: Props) {
  const sections = layoutShoppingListForHome(items)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8 pt-6">
      <header className="mb-6 border-b border-border pb-4">
        <p className="font-mono text-xs tracking-wide text-muted uppercase">
          Running log
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-text">
            Groceries
          </h1>
          <button
            type="button"
            onClick={onAddItems}
            className="shrink-0 border border-accent/40 bg-accent/15 px-3 py-1.5 font-sans text-sm font-medium text-accent transition-colors hover:bg-accent/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Add items
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="font-mono text-sm text-muted">
          Nothing yet. Tap <span className="text-accent">Add items</span> to pull
          from your stock sheet.
        </p>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.sectionId}>
              <h2 className="mb-2 font-sans text-base font-semibold tracking-tight text-text">
                {section.title}
              </h2>
              <ul className="divide-y divide-border border-y border-border">
                {section.items.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => onRemove(row.id)}
                      className="flex w-full items-baseline justify-between gap-3 py-2.5 text-left font-mono text-sm text-text transition-colors hover:bg-surface/60 focus-visible:bg-surface/80 focus-visible:outline-none active:bg-surface"
                    >
                      <span className="min-w-0 shrink">{row.label}</span>
                      <span className="shrink-0 font-sans text-xs text-muted tabular-nums">
                        remove
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
