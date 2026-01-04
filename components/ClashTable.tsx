import React, { useState } from 'react';
import { EnrichedClash, ClashSeverity, ClashStatus } from '../types';
import { SEVERITY_COLORS, RESPONSIBILITY_COLORS } from '../constants';
import { AlertCircle, CheckCircle, Info, XCircle, MoreHorizontal, FileText, Layers } from 'lucide-react';

interface ClashTableProps {
  clashes: EnrichedClash[];
}

const ClashTable: React.FC<ClashTableProps> = ({ clashes }) => {
  const [filter, setFilter] = useState<ClashSeverity | 'ALL'>('ALL');

  const filteredClashes = filter === 'ALL' 
    ? clashes 
    : clashes.filter(c => c.aiSeverity === filter);

  const getSeverityIcon = (severity: ClashSeverity) => {
    switch (severity) {
      case ClashSeverity.CRITICAL: return <AlertCircle className="w-4 h-4 text-red-500" />;
      case ClashSeverity.DESIGN_ISSUE: return <Info className="w-4 h-4 text-orange-500" />;
      case ClashSeverity.TOLERANCE_ISSUE: return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case ClashSeverity.FALSE_CLASH: return <XCircle className="w-4 h-4 text-green-500" />;
      default: return <MoreHorizontal className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 flex gap-2 overflow-x-auto">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {Object.values(ClashSeverity).filter(s => s !== ClashSeverity.UNKNOWN).map(severity => (
          <button
            key={severity}
            onClick={() => setFilter(severity)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2
              ${filter === severity ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'}
            `}
            style={{ 
              backgroundColor: filter === severity ? SEVERITY_COLORS[severity] : `${SEVERITY_COLORS[severity]}20`,
              color: filter === severity ? 'white' : SEVERITY_COLORS[severity],
              ringColor: SEVERITY_COLORS[severity]
            }}
          >
            {getSeverityIcon(severity)}
            {severity}
          </button>
        ))}
      </div>

      {/* Table Header */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-500 w-16">ID</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Clash Items</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Distance</th>
              <th className="px-6 py-3 font-semibold text-gray-500">AI Classification</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Responsibility</th>
              <th className="px-6 py-3 font-semibold text-gray-500">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClashes.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                   No clashes found matching this filter.
                 </td>
               </tr>
            ) : (
              filteredClashes.map((clash) => (
                <tr key={clash.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{clash.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        {clash.item1}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        {clash.item2}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{clash.distance}</td>
                  <td className="px-6 py-4">
                    {clash.status === ClashStatus.COMPLETED ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{ 
                          borderColor: `${SEVERITY_COLORS[clash.aiSeverity]}40`,
                          backgroundColor: `${SEVERITY_COLORS[clash.aiSeverity]}10`, 
                          color: SEVERITY_COLORS[clash.aiSeverity] 
                        }}>
                        {clash.aiSeverity}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Processing...</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     {clash.status === ClashStatus.COMPLETED && (
                       <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-gray-100"
                        style={{ color: RESPONSIBILITY_COLORS[clash.aiResponsibility] }}>
                         <Layers className="w-3 h-3" />
                         {clash.aiResponsibility}
                       </span>
                     )}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    {clash.status === ClashStatus.COMPLETED ? (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 text-xs leading-relaxed">{clash.aiDescription}</p>
                      </div>
                    ) : (
                      <div className="h-2 w-24 bg-gray-100 rounded animate-pulse"></div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClashTable;
