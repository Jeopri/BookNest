'use client'
import Linechart from '@/components/linechart';
import Piechart from '@/components/piechart';
import MetricCard from '@/components/MetricCard';
import { TrendingUp, BookOpen, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type DashboardStats = {
  totalUsers: number;
  totalBooks: number;
  borrowedBooks: number;
  overdueItems: number;
  prevTotalBooks: number;
  prevBorrowedBooks: number;
  prevOverdueItems: number;
  genreDistribution: { name: string; value: number; percentage: number }[];
  activityData: { name: string; borrowed: number; returned: number; active: number }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calcPercentage = (current: number, prev: number) =>
    prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={36} className="animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500 text-sm">Loading dashboard...</span>
      </div>
    );
  }

  const totalBooks = stats?.totalBooks ?? 0;
  const borrowedBooks = stats?.borrowedBooks ?? 0;
  const overdueItems = stats?.overdueItems ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  const cards = [
    {
      title: 'Total Users',
      icon: <Users className="w-6 h-6" />,
      value: totalUsers.toLocaleString(),
      previousValue: stats?.totalUsers ?? 0,
      description: 'Registered users',
      bgGradient: 'from-blue-600 to-cyan-600',
      isPositive: true,
      percentage: 0,
    },
    {
      title: 'Total Books',
      icon: <BookOpen className="w-6 h-6" />,
      value: totalBooks.toLocaleString(),
      previousValue: stats?.prevTotalBooks ?? totalBooks,
      description: 'Books in inventory',
      bgGradient: 'from-emerald-600 to-green-600',
      isPositive: totalBooks >= (stats?.prevTotalBooks ?? totalBooks),
      percentage: calcPercentage(totalBooks, stats?.prevTotalBooks ?? totalBooks),
    },
    {
      title: 'Borrowed Books',
      icon: <TrendingUp className="w-6 h-6" />,
      value: borrowedBooks.toLocaleString(),
      previousValue: stats?.prevBorrowedBooks ?? borrowedBooks,
      description: 'Currently on loan',
      bgGradient: 'from-amber-600 to-orange-600',
      isPositive: true,
      percentage: calcPercentage(borrowedBooks, stats?.prevBorrowedBooks ?? borrowedBooks),
    },
    {
      title: 'Overdue Items',
      icon: <AlertCircle className="w-6 h-6" />,
      value: overdueItems.toLocaleString(),
      previousValue: stats?.prevOverdueItems ?? overdueItems,
      description: 'Books past due date',
      bgGradient: 'from-red-600 to-pink-600',
      isPositive: overdueItems <= (stats?.prevOverdueItems ?? overdueItems),
      percentage: calcPercentage(overdueItems, stats?.prevOverdueItems ?? overdueItems),
    },
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
            <p className="text-sm text-gray-500 mt-1">Daily activity over the last 7 days</p>
          </div>
          <div className="h-80">
            <Linechart data={stats?.activityData ?? []} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Book Distribution</h3>
            <p className="text-sm text-gray-500 mt-1">Genre breakdown</p>
          </div>
          <div className="min-h-[350px]">
            <Piechart data={stats?.genreDistribution ?? []} />
          </div>
        </div>
      </div>
    </>
  );
}
