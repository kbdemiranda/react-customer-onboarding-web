import { HelpCircle } from 'lucide-react'

export function Header() {
  return (
    <header className="flex h-[72px] items-center justify-between bg-white px-6 shadow-sm sm:px-12 border-b border-slate-200">
      <div className="text-xl font-bold text-[#003399]">Horizon Bank</div>
      
      <nav className="hidden h-full items-center gap-8 md:flex">
        <a href="#" className="flex h-full items-center border-b-2 border-[#003399] px-1 text-sm font-medium text-[#003399]">Dados Pessoais</a>
        <a href="#" className="flex h-full items-center border-b-2 border-transparent px-1 text-sm font-medium text-slate-400 hover:text-slate-600">Contato</a>
        <a href="#" className="flex h-full items-center border-b-2 border-transparent px-1 text-sm font-medium text-slate-400 hover:text-slate-600">Endereço</a>
        <a href="#" className="flex h-full items-center border-b-2 border-transparent px-1 text-sm font-medium text-slate-400 hover:text-slate-600">Documentos</a>
        <a href="#" className="flex h-full items-center border-b-2 border-transparent px-1 text-sm font-medium text-slate-400 hover:text-slate-600">Revisão</a>
      </nav>

      <div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}
