import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useWidgetProps } from '../shared/use-widget-props';
import { useWebplusGlobal } from '../shared/use-webplus-global';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

interface CRMExportData {
  export_config: {
    crm_system: string;
    lead_count: number;
    create_tasks: boolean;
    set_reminders: boolean;
  };
  export_options: {
    crm_systems: string[];
    formats: string[];
    fields: string[];
    automation: string[];
  };
  export_status: string;
  lead_ids: string[];
}

function CRMExportApp() {
  const toolOutput = useWidgetProps<CRMExportData>();
  const theme = useWebplusGlobal('theme');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  
  const config = toolOutput?.export_config;
  const options = toolOutput?.export_options;
  const leadIds = toolOutput?.lead_ids ?? [];
  
  const handleExport = async () => {
    setExporting(true);
    // Simulate export
    setTimeout(() => {
      setExporting(false);
      setExported(true);
    }, 2000);
  };
  
  if (!config || !options) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading export options...</p>
      </div>
    );
  }
  
  return (
    <div className={`w-full ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <Download className="w-6 h-6 mr-2 text-blue-600" />
          Export to CRM
        </h2>
        
        {/* Export Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Export Summary</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>• {config.lead_count} leads ready for export</p>
            <p>• Target CRM: {config.crm_system.charAt(0).toUpperCase() + config.crm_system.slice(1)}</p>
            <p>• Create follow-up tasks: {config.create_tasks ? 'Yes' : 'No'}</p>
            <p>• Set reminders: {config.set_reminders ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {/* Export Status */}
        {exported ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-900 dark:text-green-100 font-medium">
                Successfully exported {config.lead_count} leads to {config.crm_system}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`w-full py-3 px-4 rounded-lg font-medium ${
              exporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {exporting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 inline mr-2" />
                Export to {config.crm_system.charAt(0).toUpperCase() + config.crm_system.slice(1)}
              </>
            )}
          </button>
        )}
        
        {/* Available Options */}
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available CRM Systems</h3>
            <div className="flex flex-wrap gap-2">
              {options.crm_systems.map(crm => (
                <span key={crm} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300">
                  {crm}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Export Fields</h3>
            <div className="flex flex-wrap gap-2">
              {options.fields.map(field => (
                <span key={field} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Note */}
        <div className="mt-6 flex items-start space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Leads will be created as new contacts in your CRM. Existing contacts will be updated with new information.
          </p>
        </div>
      </div>
    </div>
  );
}

// Mount the component
const root = document.getElementById('crm-export-root');
if (root) {
  createRoot(root).render(<CRMExportApp />);
}

