import { HelpCircle } from 'lucide-react'

export function Header() {
  return (
    <header className="flex h-[72px] items-center justify-between bg-white px-6 shadow-sm sm:px-12 border-b border-slate-200">
      <div className="text-xl font-bold text-[#003399]">Horizon Bank</div>
      
      <div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
