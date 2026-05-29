'use client';

import { ChevronRight, LogOut, Menu, SquareKanban, User, X } from 'lucide-react';
import { signOut } from 'next-auth/react'; // Import signOut
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error('Failed to load sidebar user:', res.status, await res.text());
        }
      } catch (error) {
        console.error('Sidebar fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
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
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {sidebarOpen ? (
          <>
            <h1 className="text-xl font-bold">Book Inventory</h1>
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

      <nav className="flex-1 overflow-y-auto pt-4">
        <ul>
          {[
            { name: 'Home', href: '/dashboard', icon: <SquareKanban size={20} /> },
            { name: 'List', href: '/listing', icon: <ChevronRight size={20} /> },
            { name: 'Profile', href: '/profile', icon: <User size={20} /> },
            { name: 'Logout', href: '#', icon: <LogOut size={20} />, action: handleLogout } // Use action for logout
          ].map((item, index) => (
            <li key={index}>
              <a
                href={item.href || "#"}
                onClick={(event) => {
                  if (item.action) {
                    event.preventDefault();
                    item.action();
                  }
                }}
                className="flex items-center p-4 hover:bg-gray-700"
              >
                <span className="mr-3">{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        {sidebarOpen ? (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-500 mr-3"></div>
            <div>
              <p className="font-semibold">{user.firstname} {user.lastname}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-500 mx-auto"></div>
        )}
      </div>
    </div>
  );
}
