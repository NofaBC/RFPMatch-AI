'use client';

import { useState } from 'react';
import { ScoredRfp } from '@/types';
import { format } from 'date-fns';
import { ChevronRight, ExternalLink, Send, X, Clock, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import RfpDetailDrawer from './RfpDetailDrawer';

interface RfpResultsTableProps {
  rfps: ScoredRfp[];
  onAction: (rfpId: string, action: 'send' | 'dismiss' | 'snooze') => void;
  isLoading?: boolean;
}

export default function RfpResultsTable({ rfps, onAction, isLoading = false }: RfpResultsTableProps) {
  const [selectedRfp, setSelectedRfp] = useState<ScoredRfp | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = (rfp: ScoredRfp) => {
    setSelectedRfp(rfp);
    setDrawerOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getUrgencyColor = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return 'text-red-600 bg-red-50';
    if (days <= 21) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Searching for matching RFPs...</p>
          <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
        </div>
      </div>
    );
  }

  if (!rfps || rfps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <div className="text-center text-gray-500">
          <TrendingUp className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No RFPs Found</h3>
          <p className="text-sm">Try adjusting your search criteria or expanding your service areas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Matching RFPs</h2>
          <p className="text-sm text-gray-500">{rfps.length} opportunities found</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info">Live Data</Badge>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opportunity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Award Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rfps.map((rfp) => {
              const daysUntilDue = Math.ceil((new Date(rfp.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <tr 
                  key={rfp.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(rfp)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {rfp.title}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {rfp.sponsor}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rfp.matchReasons.slice(0, 2).map((reason, idx) => (
                            <Badge key={idx} variant="success" size="sm">
                              {reason}
                            </Badge>
                          ))}
                          {rfp.certifications && rfp.certifications.length > 0 && (
                            <Badge variant="warning" size="sm">
                              {rfp.certifications[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(rfp.dueDate)}`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(rfp.dueDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'CLOSED'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      {formatAwardAmount(rfp.amountMin, rfp.amountMax, rfp.amountText)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold border ${getScoreColor(rfp.score)}`}>
                        {rfp.score}%
                      </div>
                      <div className="ml-2 text-xs text-gray-500">
                        Conf: {rfp.confidence}%
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-primary-600 h-1 rounded-full" 
                          style={{ width: `${rfp.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAction(rfp.id, 'send')}
                        title="Send to Client"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAction(rfp.id, 'snooze')}
                        title="Snooze for Later"
                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAction(rfp.id, 'dismiss')}
                        title="Dismiss"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(rfp.url, '_blank')}
                        title="View Original RFP"
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      {selectedRfp && (
        <RfpDetailDrawer
          rfp={selectedRfp}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onAction={onAction}
        />
      )}
    </div>
  );
}

// Helper function to format award amounts
function formatAwardAmount(min?: number, max?: number, text?: string): string {
  if (text) return text;
  if (min && max) {
    if (min === max) return `$${(min / 1000).toFixed(0)}K`;
    return `$${(min / 1000).toFixed(0)}K - $${(max / 1000000).toFixed(1)}M`;
  }
  if (min) return `≥ $${(min / 1000).toFixed(0)}K`;
  if (max) return `≤ $${(max / 1000000).toFixed(1)}M`;
  return 'Not specified';
}
