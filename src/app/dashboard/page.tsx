'use client'
import Linechart from '@/components/linechart';
import Piechart from '@/components/piechart';
import Footer from '@/components/util/Footer';
import Header from '@/components/util/Header';
import Sidebar from '@/components/util/Sidebar';
import { Milestone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
const [user, setUser] = useState<any>(null);


useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }else{
        console.error('Failed to load user:', res.status, await res.text());
      } 
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }
  fetchUser();

  const interval =  setInterval(fetchUser, 10000);
  return () => clearInterval(interval);
}, []);


    const CardData = [
  {
    title: 'User',
    icon: <User className="text-green-500" />,
    description: `Total Users: ${user ? user.totalUsers : 'Loading...'}`,
  },
  {
    title: 'Appointments',
    icon: <Milestone className="text-yellow-500" />,
    description: 'Total Books: 12',
  },
];
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
    <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome to your dashboard panel</p>
          </div>

          {/* Dashboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
            {CardData.map(({ title, icon, description }) => (
                <div key={title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-2">
                    <span className="mr-3">{icon}</span>
                    <h3 className="font-bold text-gray-700">{title}</h3>
                </div>
                <p className="text-black text-sm p-2 font-bold">{description}</p>
                </div>
            ))}
            </div>

          {/* Main content area */}
          <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">Daily Activity</h3>

                <div className="flex items-center justify-between space-x-6">
                    {/* Metric Box */}
                    <div className="bg-gray-100 flex-1 rounded-lg p-11">
                    <Linechart />
                    </div>

                    {/* Pie Chart Placeholder */}
                    <div className="bg-gray-100 flex-1 rounded-lg p-4">
                    <div className="w-full h-64">
                        <Piechart />
                    </div>
                    </div>
                </div>
                </div>

        </main>

        {/* Footer */}
       <Footer />
      </div>
    </div>
  );
}