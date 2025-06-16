import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  FileSpreadsheet,
  Database,
  Settings,
  Clock,
  User
} from 'lucide-react';
import { ExportGamesAccess, ImportGamesAccess } from '../auth/GamesAccessControl';

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  includeAnalytics: boolean;
  includePlayerData: boolean;
  includeRecommendations: boolean;
  dateRange: string;
  gameIds: number[];
}

interface ImportResult {
  success: boolean;
  processed: number;
  errors: string[];
  warnings: string[];
}

const GameFileManager: React.FC<FileManagerProps> = ({ isOpen, onClose, mode }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'xlsx',
    includeAnalytics: true,
    includePlayerData: false,
    includeRecommendations: true,
    dateRange: '30d',
    gameIds: []
  });

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock export history
  const exportHistory = [
    {
      id: 1,
      filename: 'games_export_2024_06_14.xlsx',
      format: 'xlsx',
      size: '2.4 MB',
      createdAt: '2024-06-14 15:30:00',
      createdBy: 'admin@gaiming.com',
      downloadCount: 3
    },
    {
      id: 2,
      filename: 'games_analytics_2024_06_13.csv',
      format: 'csv',
      size: '1.8 MB',
      createdAt: '2024-06-13 10:15:00',
      createdBy: 'manager@gaiming.com',
      downloadCount: 1
    }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImportFile(acceptedFiles[0]);
      setImportResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleExport = async () => {
    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate export process
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Trigger download
          const blob = new Blob(['Mock export data'], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `games_export_${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate import process
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Mock import result
          setImportResult({
            success: true,
            processed: 156,
            errors: ['Row 23: Invalid RTP value', 'Row 45: Missing provider ID'],
            warnings: ['Row 12: Game already exists, updated', 'Row 67: Unusual bet range']
          });
          return 100;
        }
        return prev + 8;
      });
    }, 150);
  };

  const downloadTemplate = (format: string) => {
    const templates = {
      csv: 'GameID,GameName,ProviderName,GameType,IsActive,MinBet,MaxBet,RTP\n1,Sample Game,Sample Provider,Slot,true,0.10,100.00,96.5',
      xlsx: 'Excel template data',
      json: JSON.stringify([{
        gameId: 1,
        gameName: 'Sample Game',
        providerName: 'Sample Provider',
        gameType: 'Slot',
        isActive: true,
        minBet: 0.10,
        maxBet: 100.00,
        rtp: 96.5
      }], null, 2)
    };

    const blob = new Blob([templates[format as keyof typeof templates]], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `games_template.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {mode === 'export' ? (
              <Download className="w-6 h-6 text-blue-600 mr-3" />
            ) : (
              <Upload className="w-6 h-6 text-green-600 mr-3" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'export' ? 'Export Games Data' : 'Import Games Data'}
              </h2>
              <p className="text-gray-600">
                {mode === 'export' 
                  ? 'Download games data in various formats' 
                  : 'Upload and import games data from files'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {mode === 'export' ? (
            <ExportGamesAccess>
              <div className="space-y-6">
                {/* Export Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Format
                    </label>
                    <select
                      value={exportOptions.format}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="csv">CSV (.csv)</option>
                      <option value="json">JSON (.json)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={exportOptions.dateRange}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                      <option value="all">All time</option>
                    </select>
                  </div>
                </div>

                {/* Include Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Include Additional Data
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'includeAnalytics', label: 'Analytics Data', description: 'Revenue, players, sessions' },
                      { key: 'includePlayerData', label: 'Player Data', description: 'Player demographics and behavior' },
                      { key: 'includeRecommendations', label: 'Recommendations', description: 'Recommendation performance data' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-start">
                        <input
                          type="checkbox"
                          id={option.key}
                          checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                          onChange={(e) => setExportOptions(prev => ({ 
                            ...prev, 
                            [option.key]: e.target.checked 
                          }))}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <label htmlFor={option.key} className="text-sm font-medium text-gray-700">
                            {option.label}
                          </label>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Settings className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                      <span className="text-sm font-medium text-blue-900">Generating export...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">{uploadProgress}% complete</p>
                  </div>
                )}

                {/* Export History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Exports</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {exportHistory.map((export_) => (
                          <tr key={export_.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <div className="flex items-center">
                                <FileSpreadsheet className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{export_.filename}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{export_.size}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{export_.createdAt}</td>
                            <td className="px-4 py-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ExportGamesAccess>
          ) : (
            <ImportGamesAccess>
              <div className="space-y-6">
                {/* File Upload Area */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-blue-600 font-medium">Drop the file here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 font-medium mb-2">
                        Drag & drop a file here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports CSV, Excel (.xlsx), and JSON files up to 50MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected File */}
                {importFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-green-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{importFile.name}</p>
                        <p className="text-sm text-green-700">
                          {(importFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setImportFile(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Templates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Download Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['csv', 'xlsx', 'json'].map((format) => (
                      <button
                        key={format}
                        onClick={() => downloadTemplate(format)}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileSpreadsheet className="w-6 h-6 text-blue-600 mr-3" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{format.toUpperCase()} Template</p>
                          <p className="text-sm text-gray-600">Download sample file</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Database className="w-5 h-5 text-green-600 mr-2 animate-pulse" />
                      <span className="text-sm font-medium text-green-900">Processing import...</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{uploadProgress}% complete</p>
                  </div>
                )}

                {/* Import Results */}
                {importResult && (
                  <div className="space-y-4">
                    <div className={`rounded-lg p-4 ${
                      importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {importResult.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            importResult.success ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {importResult.success ? 'Import Completed' : 'Import Failed'}
                          </p>
                          <p className={`text-sm ${
                            importResult.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Processed {importResult.processed} records
                          </p>
                        </div>
                      </div>
                    </div>

                    {importResult.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Errors ({importResult.errors.length})</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {importResult.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-2">Warnings ({importResult.warnings.length})</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {importResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ImportGamesAccess>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {mode === 'export' ? (
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {isProcessing ? 'Exporting...' : 'Export Data'}
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={!importFile || isProcessing}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Importing...' : 'Import Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameFileManager;
