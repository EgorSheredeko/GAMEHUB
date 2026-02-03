import Link from 'next/link';
import { Search, ShoppingBag, User, Bell } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#28282b] bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-[#8a2be2]">
          SULU<span className="text-white">GAMER</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-[#1a1a1b] border border-[#28282b] rounded-full px-4 py-1.5 w-96">
          <Search className="w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Поиск игр, скинов, игроков..." 
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link href="/marketplace" className="text-gray-400 hover:text-[#8a2be2] transition-colors">
            <ShoppingBag className="w-6 h-6" />
          </Link>
          <Bell className="w-6 h-6 text-gray-400 hover:text-[#8a2be2]" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8a2be2] to-blue-500 border border-[#28282b] cursor-pointer" />
        </div>
      </div>
    </nav>
  );
}