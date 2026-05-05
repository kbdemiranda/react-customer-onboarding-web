import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type HeaderProps = {
  onStatusClick?: () => void
}

export function Header({ onStatusClick }: HeaderProps) {
  const navigate = useNavigate()

  const handleStatusClick = () => {
    if (onStatusClick) {
      onStatusClick()
      return
    }

    navigate('/onboarding/status')
  }

  return (
    <header className="flex h-[72px] items-center justify-between bg-white px-6 shadow-sm sm:px-12 border-b border-slate-200">
      <div className="text-xl font-bold text-[#003399]">Horizon Bank</div>

      <div>
        <button
          type="button"
          onClick={handleStatusClick}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Search className="h-4 w-4" />
          Consultar
        </button>
      </div>
    </header>
  )
}
