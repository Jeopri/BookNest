'use client'
import Linechart from '@/components/linechart';
import Piechart from '@/components/piechart';
import MetricCard from '@/components/MetricCard';
import { TrendingUp, BookOpen, Users, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type UserData = {
  totalUsers: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          setUser(await res.json());
        } else {
          console.error('Failed to load user:', res.status);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
    const interval = setInterval(fetchUser, 10000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { title: 'Total Users', icon: <Users className="w-6 h-6" />, value: user?.totalUsers ?? '0', previousValue: 156, description: 'Active users', bgGradient: 'from-blue-600 to-cyan-600', isPositive: true, percentage: 12 },
    { title: 'Total Books', icon: <BookOpen className="w-6 h-6" />, value: '1,250', previousValue: 1156, description: 'Books in inventory', bgGradient: 'from-emerald-600 to-green-600', isPositive: true, percentage: 8 },
    { title: 'Borrowed Books', icon: <TrendingUp className="w-6 h-6" />, value: '342', previousValue: 325, description: 'Currently borrowed', bgGradient: 'from-amber-600 to-orange-600', isPositive: true, percentage: 5 },
    { title: 'Overdue Items', icon: <AlertCircle className="w-6 h-6" />, value: '23', previousValue: 25, description: 'Books overdue', bgGradient: 'from-red-600 to-pink-600', isPositive: false, percentage: 3 },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here&apos;s your book inventory summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(c => <MetricCard key={c.title} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Activity Trend</h3>
            <p className="text-sm text-gray-500 mt-1">Daily activity over the last 30 days</p>
          </div>
          <div className="h-80">
            <Linechart />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Book Distribution</h3>
            <p className="text-sm text-gray-500 mt-1">Category breakdown</p>
          </div>
          <div className="min-h-[350px]">
            <Piechart />
          </div>
        </div>
      </div>
    </>
  );
}
