import React from 'react';
import { EnrichedClash, ClashSeverity } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SEVERITY_COLORS } from '../constants';

interface ClashStatsProps {
  clashes: EnrichedClash[];
}

const ClashStats: React.FC<ClashStatsProps> = ({ clashes }) => {
  const total = clashes.length;
  
  const stats = clashes.reduce((acc, clash) => {
    const sev = clash.aiSeverity || ClashSeverity.UNKNOWN;
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(stats).map(([name, value]) => ({
    name,
    value: value as number,
    color: SEVERITY_COLORS[name as ClashSeverity] || '#999'
  })).filter(d => d.value > 0);

  const criticalCount = stats[ClashSeverity.CRITICAL] || 0;
  const criticalPct = total > 0 ? Math.round((criticalCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Clashes</h3>
        <span className="text-4xl font-bold text-gray-900 mt-2">{total}</span>
        <span className="text-sm text-gray-400 mt-1">Items imported</span>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center border-l-4 border-l-red-500">
        <h3 className="text-red-500 text-sm font-medium uppercase tracking-wider">Critical Issues</h3>
        <span className="text-4xl font-bold text-red-600 mt-2">{criticalCount}</span>
        <span className="text-sm text-red-400 mt-1">{criticalPct}% of total</span>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <h3 className="text-gray-700 text-sm font-semibold mb-2 ml-2">Triage Distribution</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ClashStats;