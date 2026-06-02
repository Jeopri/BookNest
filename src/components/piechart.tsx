'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const pieData = [
  { name: 'Fiction', value: 320, percentage: 35 },
  { name: 'Non-Fiction', value: 280, percentage: 30 },
  { name: 'Science', value: 190, percentage: 20 },
  { name: 'Biography', value: 160, percentage: 15 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{payload[0]?.payload?.name}</p>
        <p className="text-xs text-gray-600">
          Books: <span className="font-semibold">{payload[0]?.value}</span>
        </p>
        <p className="text-xs text-gray-600">
          Share: <span className="font-semibold">{payload[0]?.payload?.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Piechart() {
  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-center h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              labelLine={false}
              paddingAngle={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Below Chart */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {pieData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            ></div>
            <div className="text-xs">
              <p className="font-semibold text-gray-900">{item.name}</p>
              <p className="text-gray-500">{item.value} books</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
