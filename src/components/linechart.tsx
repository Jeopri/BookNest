'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';

const data = [
  { name: 'Mon', borrowed: 45, returned: 28, active: 17 },
  { name: 'Tue', borrowed: 52, returned: 35, active: 17 },
  { name: 'Wed', borrowed: 48, returned: 32, active: 16 },
  { name: 'Thu', borrowed: 61, returned: 40, active: 21 },
  { name: 'Fri', borrowed: 55, returned: 38, active: 17 },
  { name: 'Sat', borrowed: 67, returned: 42, active: 25 },
  { name: 'Sun', borrowed: 72, returned: 48, active: 24 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{payload[0]?.payload?.name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-xs">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Linechart() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <ReferenceLine y={50} stroke="#f3f4f6" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="borrowed"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorBorrowed)"
            strokeWidth={2}
            name="Books Borrowed"
          />
          <Area
            type="monotone"
            dataKey="returned"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorReturned)"
            strokeWidth={2}
            name="Books Returned"
          />
          <Area
            type="monotone"
            dataKey="active"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#colorActive)"
            strokeWidth={2}
            name="Active Users"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
