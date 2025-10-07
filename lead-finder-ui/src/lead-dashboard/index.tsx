import React from 'react';
import { createRoot } from 'react-dom/client';
import { useWidgetProps } from '../shared/use-widget-props';
import { useWebplusGlobal } from '../shared/use-webplus-global';
import { TrendingUp, Users, Target, Percent } from 'lucide-react';

interface DashboardData {
  analytics: {
    total_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    conversion_rate: number;
    avg_response_time: string;
  };
  trends: {
    weekly_growth: number;
    monthly_growth: number;
    top_industries: string[];
    top_locations: string[];
  };
  time_series?: Array<{
    date: string;
    leads: number;
    conversions: number;
  }>;
}

function LeadDashboardApp() {
  const toolOutput = useWidgetProps<DashboardData>();
  const displayMode = useWebplusGlobal('displayMode');
  const maxHeight = useWebplusGlobal('maxHeight');
  const theme = useWebplusGlobal('theme');
  
  const analytics = toolOutput?.analytics;
  const trends = toolOutput?.trends;
  const timeSeries = toolOutput?.time_series ?? [];
  
  if (!analytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }
  
  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );
  
  return (
    <div 
      className={`w-full ${theme === 'dark' ? 'dark' : ''}`}
      style={{ maxHeight: displayMode === 'inline' ? '480px' : maxHeight }}
    >
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 overflow-y-auto" style={{ maxHeight: displayMode === 'inline' ? '480px' : maxHeight }}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Lead Analytics Dashboard
        </h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={Users}
            label="Total Leads"
            value={analytics.total_leads}
            color="text-blue-600"
          />
          <StatCard 
            icon={Target}
            label="Hot Leads"
            value={analytics.hot_leads}
            color="text-red-600"
          />
          <StatCard 
            icon={Percent}
            label="Conversion Rate"
            value={`${(analytics.conversion_rate * 100).toFixed(1)}%`}
            color="text-green-600"
          />
          <StatCard 
            icon={TrendingUp}
            label="Response Time"
            value={analytics.avg_response_time}
            color="text-purple-600"
          />
        </div>
        
        {/* Lead Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Lead Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hot Leads</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{analytics.hot_leads}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.hot_leads / analytics.total_leads) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Warm Leads</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{analytics.warm_leads}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.warm_leads / analytics.total_leads) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cold Leads</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{analytics.cold_leads}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.cold_leads / analytics.total_leads) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Growth Trends */}
        {trends && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Growth</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Weekly</span>
                  <span className="text-sm font-medium text-green-600">+{(trends.weekly_growth * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly</span>
                  <span className="text-sm font-medium text-green-600">+{(trends.monthly_growth * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Top Industries</h3>
              <div className="space-y-1">
                {trends.top_industries.map((industry, i) => (
                  <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
                    {i + 1}. {industry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mount the component
const root = document.getElementById('lead-dashboard-root');
if (root) {
  createRoot(root).render(<LeadDashboardApp />);
}

