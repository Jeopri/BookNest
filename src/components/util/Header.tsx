'use client';
import { Bell, Menu } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

export default function Header() {
  const { toggle } = useSidebar();
  return (
    <header className="bg-white shadow-sm z-10">
    <div className="px-4 py-3 flex items-center justify-between">
      <button onClick={toggle} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 md:hidden">
        <Menu size={20} />
      </button>
      <div className="flex-1 px-4 md:px-8">
        <h2 className="text-lg font-semibold text-gray-800">Book Inventory</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-1 rounded-md text-gray-500 hover:bg-gray-100 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
      </div>
    </div>
  </header>
  )
}
