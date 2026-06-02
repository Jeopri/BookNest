'use client'
import Linechart from '@/components/linechart';
import Piechart from '@/components/piechart';
import Footer from '@/components/util/Footer';
import Header from '@/components/util/Header';
import Sidebar from '@/components/util/Sidebar';
import { TrendingUp, BookOpen, Users, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    title: 'Total Users',
    icon: <Users className="w-6 h-6" />,
    value: user ? user.totalUsers : '0',
    previousValue: 156,
    description: 'Active users',
    bgGradient: 'from-blue-600 to-cyan-600',
    iconColor: 'text-blue-600',
    isPositive: true,
    percentage: 12,
  },
  {
    title: 'Total Books',
    icon: <BookOpen className="w-6 h-6" />,
    value: '1,250',
    previousValue: 1156,
    description: 'Books in inventory',
    bgGradient: 'from-emerald-600 to-green-600',
    iconColor: 'text-emerald-600',
    isPositive: true,
    percentage: 8,
  },
  {
    title: 'Borrowed Books',
    icon: <TrendingUp className="w-6 h-6" />,
    value: '342',
    previousValue: 325,
    description: 'Currently borrowed',
    bgGradient: 'from-amber-600 to-orange-600',
    iconColor: 'text-amber-600',
    isPositive: true,
    percentage: 5,
  },
  {
    title: 'Overdue Items',
    icon: <AlertCircle className="w-6 h-6" />,
    value: '23',
    previousValue: 25,
    description: 'Books overdue',
    bgGradient: 'from-red-600 to-pink-600',
    iconColor: 'text-red-600',
    isPositive: false,
    percentage: 3,
  },
];
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
    <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your book inventory summary</p>
          </div>

          {/* Metric Cards with Modern Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {CardData.map(({ title, icon, value, previousValue, description, bgGradient, iconColor, isPositive, percentage }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient Background */}
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${bgGradient} opacity-5 rounded-full -mr-20 -mt-20 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative p-6 z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient} text-white shadow-md`}>
                      {icon}
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {percentage}%
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-gray-600 text-sm font-semibold mb-3">{title}</h3>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Previous:</span> {previousValue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Activity Trend</h3>
                <p className="text-sm text-gray-500 mt-1">Daily activity over the last 30 days</p>
              </div>
              <div className="h-80 -mx-6 px-6">
                <Linechart />
              </div>
            </div>

            {/* Pie Chart Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Book Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Category breakdown</p>
              </div>
              <div className="h-80 flex items-center justify-center">
                <Piechart />
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