'use client';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type MetricCardProps = {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  previousValue: number;
  description: string;
  bgGradient: string;
  isPositive: boolean;
  percentage: number;
};

export default function MetricCard({ title, icon, value, previousValue, description, bgGradient, isPositive, percentage }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${bgGradient} opacity-5 rounded-full -mr-20 -mt-20 group-hover:opacity-10 transition-opacity`} />
      <div className="relative p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient} text-white shadow-md`}>
            {icon}
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {percentage}%
          </div>
        </div>

        <h3 className="text-gray-600 text-sm font-semibold mb-3">{title}</h3>
        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Previous:</span> {previousValue}
          </p>
        </div>
      </div>
    </div>
  );
}
