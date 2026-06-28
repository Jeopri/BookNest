'use client';

import { ChevronRight, LogOut, Menu, SquareKanban, User, X, BookOpenText, Library, ClipboardCheck, BookOpenCheck, BarChart3, Sparkles, Calendar  } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

const STORAGE_KEY = 'sidebar_user';

type SidebarUser = { firstname: string; lastname: string; email: string; role: string; image?: string };

function loadCachedUser(): SidebarUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedUser(user: SidebarUser) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch { }
}

export default function Sidebar() {
  const pathname = usePathname();
  const { open: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  useEffect(() => {
    const cached = loadCachedUser();
    (async () => {
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const data = await res.json();
          saveCachedUser(data.user);
          setUser(data.user);
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } catch (error) {
        console.error('Sidebar fetch failed:', error);
        if (cached) setUser(cached);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/signin' });
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-800 text-white p-4">
        <p>Loading sidebar...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-64 bg-gray-800 text-white p-4">
        <p>User not authenticated</p>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        {sidebarOpen ? (
          <>
            <h1 className="text-lg font-bold">Book Inventory</h1>
            <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-700">
              <X size={20} />
            </button>
          </>
        ) : (
          <button onClick={toggleSidebar} className="p-1 mx-auto rounded-md hover:bg-gray-700">
            <Menu size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto pt-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
          FEATURES
        </div>
        <ul className="space-y-1">
          {[
            { name: 'Dashboard', href: '/dashboard', icon: <SquareKanban size={20} /> },
            { name: 'Books', href: '/listing', icon: <Library size={20} /> },
            { name: 'Borrow Books', href: '/borrow', icon: <BookOpenText size={20} /> },
            { name: 'Return Books', href: '/return', icon: <BookOpenCheck size={20} /> },
            { name: 'Overdue', href: '/overdue', icon: <ClipboardCheck size={20} /> },
            { name: 'Reservations', href: '/reservations', icon: <Calendar size={20} /> },
            { name: 'Reports / Analytics', href: '/reports', icon: <BarChart3 size={20} /> },
            { name: 'AI Recommendations', href: '/recommendations', icon: <Sparkles size={20} /> },
          ].map((item, index) => (
            <li key={index}>
              <Link
                href={item.href || "#"}
                className={`flex items-center p-3 transition ${
                  isActive(item.href) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 px-4 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
          USER INFORMATION
        </div>
        <ul className="space-y-1">
          {[
            ...(user.role === 'admin' ? [{ name: 'Users', href: '/users', icon: <User size={20} /> }] : []),
            { name: 'Profile', href: '/profile', icon: <User size={20} /> },
          ].map((item, index) => (
            <li key={`user-${index}`}>
              <Link
                href={item.href || "#"}
                className={`flex items-center p-3 transition ${
                  isActive(item.href) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 px-4 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
          LOGS
        </div>
        <ul className="space-y-1">
          {[
            { name: 'Borrow History Logs', href: '/logs/borrow-history', icon: <ChevronRight size={20} /> },
            { name: 'System Logs', href: '/logs/system', icon: <ChevronRight size={20} /> },
          ].map((item, index) => (
            <li key={`log-${index}`}>
              <Link
                href={item.href || "#"}
                className={`flex items-center p-3 transition ${
                  isActive(item.href) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

<div className="p-3 border-t border-gray-700">
  {sidebarOpen ? (
    <div className="flex items-center justify-between">
      
      {/* User info */}
      <div className="flex items-center gap-2">
        {user.image ? (
          <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-500" />
        )}
        <div>
          <p className="text-sm font-semibold">
            {user.firstname} {user.lastname}
          </p>
          <p className="text-xs text-gray-400">{user.email}</p>
          <span className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded mt-0.5 ${
            user.role === 'admin' ? 'bg-red-500 text-white' :
            user.role === 'staff' ? 'bg-blue-500 text-white' :
            'bg-green-500 text-white'
          }`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-gray-300 hover:text-red-500 transition"
        title="Logout"
      >
        <LogOut size={18} />
      </button>

    </div>
  ) : (
    <div className="flex justify-center">
      <button
        onClick={handleLogout}
        className="text-gray-300 hover:text-red-500 transition"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </div>
  )}
</div>
    </div>
  );
}
