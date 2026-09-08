import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-warning/20 border-b border-warning text-warning px-4 py-2 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Modo Offline - Los datos se sincronizarán cuando estés en línea</span>
    </div>
  )
}
