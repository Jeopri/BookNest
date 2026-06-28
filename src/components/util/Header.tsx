'use client';
import { Bell, BookOpen, Menu, X } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useEffect, useRef, useState } from 'react';

type NotificationItem = {
  _id: string;
  type: 'borrow' | 'return' | 'overdue';
  message: string;
  bookTitle?: string;
  borrowerName?: string;
  read: boolean;
  createdAt: string;
};

type HeaderUser = {
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
};

export default function Header() {
  const { toggle } = useSidebar();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch { }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

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
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(o => !o)} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-semibold text-sm text-gray-800">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => !n.read && handleMarkRead(n._id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 cursor-pointer transition-colors ${n.read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
                      >
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                        <BookOpen size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div ref={userMenuRef} className="relative">
            <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-2 focus:outline-none">
              {user?.image ? (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-400 transition" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-400 transition" />
              )}
            </button>

            {userMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                </div>
                <div className="px-4 py-2">
                  <span className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
