import { useState } from 'react'
import { useShoppingList } from './hooks/useShoppingList'
import { useCatalog } from './hooks/useCatalog'
import { ReceiptLog } from './components/ReceiptLog'
import { StockSheet } from './components/StockSheet'

type View = 'home' | 'edit'

function App() {
  const [view, setView] = useState<View>('home')

  const {
    items,
    toggleItemByLabel,
    removeItem,
    removeItemsBySection,
    clearList,
    hasLabel,
  } = useShoppingList()

  const {
    catalog,
    addItem: addCatalogItem,
    removeItem: removeCatalogItem,
    renameItem,
    addSection,
    removeSection,
    renameSection,
  } = useCatalog()

  const handleDeleteSection = (sectionId: string) => {
    removeSection(sectionId)
    removeItemsBySection(sectionId)
  }

  return view === 'home' ? (
    <ReceiptLog
      items={items}
      catalog={catalog}
      onRemove={removeItem}
      onClear={clearList}
      onAddItems={() => setView('edit')}
    />
  ) : (
    <StockSheet
      catalog={catalog}
      onBack={() => setView('home')}
      onPick={toggleItemByLabel}
      hasOnList={hasLabel}
      onAddCatalogItem={addCatalogItem}
      onRemoveCatalogItem={removeCatalogItem}
      onRenameCatalogItem={renameItem}
      onAddSection={addSection}
      onDeleteSection={handleDeleteSection}
      onRenameSection={renameSection}
    />
  )
}

export default App
