'use client'
import { Milestone, User, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDeviceInfo } from '@/hook/useDevice';

export default function ProfilePage() {
  const [user, setUser] = useState<{ firstname: string; lastname: string; email: string; role: string; createdAt: string } | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const { label } = useDeviceInfo();
  const [ip, setIp] = useState('');

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setIp(d.ip));
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/user');
      if (res.ok) setUser((await res.json()).user);
    })();
  }, []);

  const userData = {
    fullName: user ? `${user.firstname} ${user.lastname}` : 'Guest',
    email: user?.email ?? '',
    dateJoined: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
    lastLogin: new Date().toLocaleDateString(),
    isVerified: true,
    recentActivity: [
      { type: "Login", date: new Date().toLocaleDateString(), details: "Logged in from Windows" },
      { type: "Profile", date: new Date().toLocaleDateString(), details: "Logged in" },
    ],
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b px-6">
          {['profile', 'security', 'activity', 'notifications'].map(tab => (
            <button key={tab}
              className={`py-4 px-6 font-medium text-sm ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'profile' ? 'Basic Info' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-start mb-6 text-black">
                <div className="mr-6">
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    <Image src="/images/ye.gif" width={90} height={90} alt="Profile" />
                  </div>
                  <button className="mt-2 w-full text-xs text-blue-600 hover:underline">Change Picture</button>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-bold">{userData.fullName}</h3>
                      {user?.role && (
                        <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <p className="mb-1">Email: <span className="font-medium">{userData.email}</span></p>
                      <p className="mb-1">Member since: <span className="font-medium">{userData.dateJoined}</span></p>
                      <p>Last login: <span className="font-medium">{userData.lastLogin}</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-6 text-black">
                <h4 className="font-medium mb-4">Edit Profile Information</h4>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={userData.fullName} className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" defaultValue={userData.email} className="w-full p-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="mb-8 text-black">
                <h4 className="font-medium mb-4">Change Password</h4>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" className="w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" className="w-full p-2 border rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Update Password</button>
                  </div>
                </form>
              </div>
              <div className="mb-8 border-t pt-6 text-black">
                <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Enhance your account security</p>
                    <p className="text-sm text-gray-600">Require a verification code when logging in</p>
                  </div>
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled(!twoFactorEnabled)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {twoFactorEnabled && (
                  <div className="mt-4 p-4 border rounded-md">
                    <p className="mb-2">Scan this QR code with your authenticator app:</p>
                    <div className="bg-white p-4 inline-block">
                      <Image src="/images/g.png" alt="QR Code" width={40} height={40} />
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t pt-6 text-black">
                <h4 className="font-medium mb-4 text-red-600">Danger Zone</h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <button className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-md hover:bg-red-50" onClick={() => setShowDeleteConfirmation(true)}>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
              {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full text-black">
                    <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
                    <p className="mb-6">This action cannot be undone. All your data will be permanently deleted.</p>
                    <div className="flex justify-end space-x-3">
                      <button className="bg-gray-200 px-4 py-2 rounded-md" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md">Yes, Delete My Account</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-black">
              <h4 className="font-medium mb-4">Recent Activity</h4>
              <div className="bg-white rounded-lg border">
                <div className="divide-y">
                  {userData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start p-4">
                      <div className="mr-4 mt-1">
                        {activity.type === 'Login' && <UserCheck className="text-blue-500" size={20} />}
                        {activity.type === 'Appointment' && <Milestone className="text-green-500" size={20} />}
                        {activity.type === 'Profile' && <User className="text-purple-500" size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{activity.type}</p>
                          <p className="text-sm text-gray-500">{activity.date}</p>
                        </div>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
                <div>
                  <h4 className="font-medium mb-4">Recent Bookings</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-center text-gray-500 p-6">No recent bookings</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Login History</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3 pb-3 border-b">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-gray-600">{ip} • Current session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="flex flex-col items-center justify-center py-12">
              <h4 className="font-medium mb-6 text-center">Notifications Settings</h4>
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <Image src="/images/ye.gif" width={512} height={512} alt="Notifications placeholder" />
              </div>
              <p className="text-gray-600 text-center">Feature under development</p>
              <p className="text-sm text-gray-500 text-center mt-2">Notification preferences will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
