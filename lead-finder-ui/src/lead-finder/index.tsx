import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useWidgetProps } from '../shared/use-widget-props';
import { useWebplusGlobal } from '../shared/use-webplus-global';
import type { LeadFinderData, Lead } from '../shared/types';
import { Target, Star, MapPin, Building, Mail, ExternalLink, TrendingUp, Zap } from 'lucide-react';

function LeadFinderApp() {
  const toolOutput = useWidgetProps<LeadFinderData>();
  const displayMode = useWebplusGlobal('displayMode');
  const maxHeight = useWebplusGlobal('maxHeight');
  const theme = useWebplusGlobal('theme');
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  
  const leads = toolOutput?.leads ?? [];
  const metrics = toolOutput?.metrics;
  const searchParams = toolOutput?.search_parameters;
  
  // Filter leads by score
  const filteredLeads = leads.filter(lead => {
    if (filterBy === 'all') return true;
    const score = lead.lead_score;
    if (filterBy === 'hot') return score >= 0.8;
    if (filterBy === 'warm') return score >= 0.6 && score < 0.8;
    if (filterBy === 'cold') return score >= 0.4 && score < 0.6;
    return false;
  });
  
  const getLeadColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };
  
  const getLeadLabel = (score: number) => {
    if (score >= 0.8) return 'Hot Lead';
    if (score >= 0.6) return 'Warm Lead';
    return 'Cold Lead';
  };
  
  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };
  
  const handleEnrichSelected = async () => {
    if (selectedLeads.length === 0) return;
    
    await window.openai?.callTool?.('enrich-prospect-data', {
      prospect_ids: selectedLeads,
      enrichment_level: 'standard'
    });
  };
  
  const handleExportSelected = async () => {
    if (selectedLeads.length === 0) return;
    
    await window.openai?.callTool?.('export-to-crm', {
      lead_ids: selectedLeads,
      crm_system: 'hubspot',
      create_tasks: true,
      set_reminders: true
    });
  };
  
  const handleShowAnalytics = async () => {
    await window.openai?.callTool?.('analyze-lead-trends', {
      time_range: '30d'
    });
  };
  
  const handleGoFullscreen = async () => {
    await window.openai?.requestDisplayMode?.({ mode: 'fullscreen' });
  };
  
  if (!toolOutput || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Target className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Found</h3>
        <p className="text-gray-500">Start by searching for business leads with specific keywords.</p>
      </div>
    );
  }
  
  return (
    <div 
      className={`w-full ${theme === 'dark' ? 'dark' : ''}`}
      style={{ maxHeight: displayMode === 'inline' ? '480px' : maxHeight }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Business Leads
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {metrics?.qualified_leads_found} leads • Avg score: {metrics?.average_lead_score.toFixed(2)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {displayMode === 'inline' && (
                <button
                  onClick={handleGoFullscreen}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Expand
                </button>
              )}
              <button
                onClick={handleShowAnalytics}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Analytics
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-2 mt-3">
            {(['all', 'hot', 'warm', 'cold'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filterBy === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter !== 'all' && ` (${leads.filter(l => {
                  const s = l.lead_score;
                  if (filter === 'hot') return s >= 0.8;
                  if (filter === 'warm') return s >= 0.6 && s < 0.8;
                  return s >= 0.4 && s < 0.6;
                }).length})`}
              </button>
            ))}
          </div>
        </div>
        
        {/* Actions Bar */}
        {selectedLeads.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEnrichSelected}
                  className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Enrich
                </button>
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
                >
                  Export to CRM
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Leads List */}
        <div className="overflow-y-auto" style={{ maxHeight: displayMode === 'inline' ? '380px' : `${maxHeight - 200}px` }}>
          <div className="p-4 space-y-3">
            {filteredLeads.map(lead => (
              <div
                key={lead.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedLeads.includes(lead.id) 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => handleSelectLead(lead.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {lead.prospect_name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getLeadColor(lead.lead_score)}`}>
                        {getLeadLabel(lead.lead_score)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        {lead.title} at {lead.company}
                      </div>
                      {lead.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {lead.location}
                        </div>
                      )}
                      {lead.contact_info?.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {lead.contact_info.email}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4 text-xs">
                      <span className="text-gray-500">
                        Score: {(lead.lead_score * 100).toFixed(0)}%
                      </span>
                      <span className="text-gray-500">
                        Intent: {lead.intent_analysis.intent_level}
                      </span>
                      <span className="text-gray-500">
                        {lead.source_platform}
                      </span>
                    </div>
                    
                    {lead.source_content && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 pl-3">
                        "{lead.source_content.substring(0, 100)}..."
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div className="flex flex-col items-end">
                      <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {(lead.lead_score * 100).toFixed(0)}
                      </span>
                    </div>
                    <a
                      href={lead.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {searchParams && (
              <>
                Search: {searchParams.keywords.join(', ')}
                {searchParams.industry && ` • ${searchParams.industry}`}
                {' • '}
                Platforms: {searchParams.platforms.join(', ')}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mount the component
const root = document.getElementById('lead-finder-root');
if (root) {
  createRoot(root).render(<LeadFinderApp />);
}

