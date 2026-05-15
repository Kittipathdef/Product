import { Search, Bell, Menu, User, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  title: string;
}

export default function Navbar({ onMenuClick, title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-gray-500" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-6">
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="h-10 w-64 rounded-full bg-gray-100 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 border-2 border-white" />
          </button>
          
          <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block" />

          <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition-colors">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-gray-900 leading-none">Poom IT</p>
              <p className="text-[10px] text-gray-500 mt-1">Administrator</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 ml-1 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
