import { useState } from 'react'
import { useShoppingList } from './hooks/useShoppingList'
import { ReceiptLog } from './components/ReceiptLog'
import { StockSheet } from './components/StockSheet'

type View = 'home' | 'edit'

function App() {
  const [view, setView] = useState<View>('home')
  const { items, toggleItemByLabel, removeItem, hasLabel } = useShoppingList()

  return view === 'home' ? (
    <ReceiptLog
      items={items}
      onRemove={removeItem}
      onAddItems={() => setView('edit')}
    />
  ) : (
    <StockSheet
      onBack={() => setView('home')}
      onPick={toggleItemByLabel}
      hasOnList={hasLabel}
    />
  )
}

export default App
