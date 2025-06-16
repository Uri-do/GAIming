import { useState, useCallback } from 'react';
import { exportService, ExportProgress, ExportFormat } from '../services/exportService';

interface UseExportOptions {
  onSuccess?: (jobId: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: ExportProgress) => void;
}

interface UseExportReturn {
  isExporting: boolean;
  progress: ExportProgress | null;
  error: string | null;
  exportData: (
    data: any[],
    format: ExportFormat,
    filename?: string,
    options?: any
  ) => Promise<void>;
  exportPlayers: (
    players: any[],
    format: ExportFormat,
    includeSensitiveData?: boolean
  ) => Promise<void>;
  exportAnalytics: (
    analytics: any,
    format: ExportFormat
  ) => Promise<void>;
  exportModels: (
    models: any[],
    format: ExportFormat
  ) => Promise<void>;
  cancelExport: () => void;
  clearError: () => void;
}

export const useExport = (options: UseExportOptions = {}): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const handleProgress = useCallback((progressData: ExportProgress) => {
    setProgress(progressData);
    options.onProgress?.(progressData);
    
    if (progressData.stage === 'completed') {
      setIsExporting(false);
      options.onSuccess?.(currentJobId || '');
    } else if (progressData.stage === 'error') {
      setIsExporting(false);
      setError(progressData.message);
      options.onError?.(new Error(progressData.message));
    }
  }, [options, currentJobId]);

  const exportData = useCallback(async (
    data: any[],
    format: ExportFormat,
    filename?: string,
    exportOptions?: any
  ) => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress(null);

      const options = {
        filename,
        includeTimestamp: true,
        onProgress: handleProgress,
        chunkSize: 1000,
        ...exportOptions,
      };

      let jobId: string;
      
      switch (format) {
        case 'csv':
          jobId = await exportService.exportToCSV(data, options);
          break;
        case 'excel':
          jobId = await exportService.exportToExcel(data, options);
          break;
        case 'pdf':
          jobId = await exportService.exportToPDF(data, options);
          break;
        case 'json':
          jobId = await exportService.exportToJSON(data, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      setCurrentJobId(jobId);
    } catch (err) {
      setIsExporting(false);
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [handleProgress, options]);

  const exportPlayers = useCallback(async (
    players: any[],
    format: ExportFormat,
    includeSensitiveData: boolean = false
  ) => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress(null);

      const options = {
        filename: 'players-export',
        includeTimestamp: true,
        onProgress: handleProgress,
        chunkSize: 500, // Smaller chunks for player data
        customHeaders: { title: 'GAIming Players Report' }
      };

      const jobId = await exportService.exportPlayerData(
        players,
        format,
        options,
        includeSensitiveData
      );
      
      setCurrentJobId(jobId);
    } catch (err) {
      setIsExporting(false);
      const errorMessage = err instanceof Error ? err.message : 'Player export failed';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [handleProgress, options]);

  const exportAnalytics = useCallback(async (
    analytics: any,
    format: ExportFormat
  ) => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress(null);

      const options = {
        filename: 'analytics-report',
        includeTimestamp: true,
        onProgress: handleProgress,
        customHeaders: { title: 'GAIming Analytics Report' }
      };

      const jobId = await exportService.exportAnalyticsReport(
        analytics,
        format,
        options
      );
      
      setCurrentJobId(jobId);
    } catch (err) {
      setIsExporting(false);
      const errorMessage = err instanceof Error ? err.message : 'Analytics export failed';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [handleProgress, options]);

  const exportModels = useCallback(async (
    models: any[],
    format: ExportFormat
  ) => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress(null);

      const options = {
        filename: 'ml-models-export',
        includeTimestamp: true,
        onProgress: handleProgress,
        chunkSize: 100, // Smaller chunks for model data
        customHeaders: { title: 'GAIming ML Models Report' }
      };

      const jobId = await exportService.exportModelsData(
        models,
        format,
        options
      );
      
      setCurrentJobId(jobId);
    } catch (err) {
      setIsExporting(false);
      const errorMessage = err instanceof Error ? err.message : 'Models export failed';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [handleProgress, options]);

  const cancelExport = useCallback(() => {
    if (currentJobId) {
      exportService.cancelExport(currentJobId);
      setIsExporting(false);
      setProgress(null);
      setCurrentJobId(null);
    }
  }, [currentJobId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isExporting,
    progress,
    error,
    exportData,
    exportPlayers,
    exportAnalytics,
    exportModels,
    cancelExport,
    clearError,
  };
};
