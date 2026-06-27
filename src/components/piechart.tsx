'use client';

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

type DataPoint = {
  name: string;
  value: number;
  percentage: number;
};

type TooltipPayloadEntry = {
  value: number;
  payload?: { name?: string; percentage?: number };
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) => {
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

export default function Piechart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              labelLine={false}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index] }}
            ></div>
            <div className="text-xs min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-gray-500">{item.value} books ({item.percentage}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
