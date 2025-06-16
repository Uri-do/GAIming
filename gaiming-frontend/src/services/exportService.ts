// Export Service for GAIming Frontend
// Provides comprehensive data export functionality

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  includeMetadata?: boolean;
  customHeaders?: Record<string, string>;
  onProgress?: (progress: ExportProgress) => void;
  chunkSize?: number;
}

export interface ExportMetadata {
  exportedAt: string;
  exportedBy: string;
  totalRecords: number;
  filters?: Record<string, any>;
  source: string;
}

export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'generating' | 'downloading' | 'completed' | 'error';
  progress: number; // 0-100
  processedRecords: number;
  totalRecords: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export interface ExportJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: ExportProgress;
  startTime: Date;
  endTime?: Date;
  result?: Blob;
  error?: string;
}

class ExportService {
  private activeJobs = new Map<string, ExportJob>();
  private jobCounter = 0;

  /**
   * Export data to CSV format with progress tracking
   */
  async exportToCSV(data: any[], options: ExportOptions = {}): Promise<string> {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const jobId = this.createExportJob(data.length);

    try {
      this.updateProgress(jobId, {
        stage: 'preparing',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: 'Preparing export...'
      }, options.onProgress);

      const filename = this.generateFilename('csv', options);

      this.updateProgress(jobId, {
        stage: 'processing',
        progress: 25,
        processedRecords: 0,
        totalRecords: data.length,
        message: 'Processing data...'
      }, options.onProgress);

      const csvContent = await this.convertToCSVWithProgress(data, options, jobId);

      this.updateProgress(jobId, {
        stage: 'downloading',
        progress: 90,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'Preparing download...'
      }, options.onProgress);

      this.downloadFile(csvContent, filename, 'text/csv');

      this.updateProgress(jobId, {
        stage: 'completed',
        progress: 100,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'Export completed successfully!'
      }, options.onProgress);

      return jobId;
    } catch (error) {
      this.updateProgress(jobId, {
        stage: 'error',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, options.onProgress);
      throw error;
    }
  }

  /**
   * Export data to Excel format (CSV with .xlsx extension)
   * Note: For true Excel format, you'd need a library like xlsx
   */
  async exportToExcel(data: any[], options: ExportOptions = {}): Promise<string> {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const jobId = this.createExportJob(data.length);

    try {
      this.updateProgress(jobId, {
        stage: 'preparing',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: 'Preparing Excel export...'
      }, options.onProgress);

      const filename = this.generateFilename('xlsx', options);
      const csvContent = await this.convertToCSVWithProgress(data, options, jobId);

      this.updateProgress(jobId, {
        stage: 'downloading',
        progress: 90,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'Preparing download...'
      }, options.onProgress);

      this.downloadFile(csvContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      this.updateProgress(jobId, {
        stage: 'completed',
        progress: 100,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'Excel export completed successfully!'
      }, options.onProgress);

      return jobId;
    } catch (error) {
      this.updateProgress(jobId, {
        stage: 'error',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: `Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, options.onProgress);
      throw error;
    }
  }

  /**
   * Export data to PDF format (simple text-based)
   * Note: For true PDF format, you'd need a library like jsPDF
   */
  async exportToPDF(data: any[], options: ExportOptions = {}): Promise<string> {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const jobId = this.createExportJob(data.length);

    try {
      this.updateProgress(jobId, {
        stage: 'preparing',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: 'Preparing PDF export...'
      }, options.onProgress);

      const filename = this.generateFilename('pdf', options);
      const pdfContent = this.convertToPDF(data, options);

      this.updateProgress(jobId, {
        stage: 'downloading',
        progress: 90,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'Preparing download...'
      }, options.onProgress);

      this.downloadFile(pdfContent, filename, 'application/pdf');

      this.updateProgress(jobId, {
        stage: 'completed',
        progress: 100,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'PDF export completed successfully!'
      }, options.onProgress);

      return jobId;
    } catch (error) {
      this.updateProgress(jobId, {
        stage: 'error',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: `PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, options.onProgress);
      throw error;
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(data: any[], options: ExportOptions = {}): Promise<string> {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const jobId = this.createExportJob(data.length);

    try {
      this.updateProgress(jobId, {
        stage: 'preparing',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: 'Preparing JSON export...'
      }, options.onProgress);

      const filename = this.generateFilename('json', options);
      const jsonContent = this.convertToJSON(data, options);

      this.updateProgress(jobId, {
        stage: 'downloading',
        progress: 90,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'Preparing download...'
      }, options.onProgress);

      this.downloadFile(jsonContent, filename, 'application/json');

      this.updateProgress(jobId, {
        stage: 'completed',
        progress: 100,
        processedRecords: data.length,
        totalRecords: data.length,
        message: 'JSON export completed successfully!'
      }, options.onProgress);

      return jobId;
    } catch (error) {
      this.updateProgress(jobId, {
        stage: 'error',
        progress: 0,
        processedRecords: 0,
        totalRecords: data.length,
        message: `JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, options.onProgress);
      throw error;
    }
  }

  // Specialized export methods
  async exportPlayerData(
    players: any[],
    format: ExportFormat,
    options: ExportOptions,
    includeSensitiveData: boolean = false
  ): Promise<string> {
    const sanitizedData = this.sanitizePlayerData(players, includeSensitiveData);
    const exportOptions = {
      ...options,
      customHeaders: {
        title: 'GAIming Players Report',
        includeSensitiveData: includeSensitiveData.toString(),
        ...options.customHeaders,
      },
    };

    switch (format) {
      case 'csv':
        return this.exportToCSV(sanitizedData, exportOptions);
      case 'excel':
        return this.exportToExcel(sanitizedData, exportOptions);
      case 'pdf':
        return this.exportToPDF(sanitizedData, exportOptions);
      case 'json':
        return this.exportToJSON(sanitizedData, exportOptions);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async exportAnalyticsReport(
    analytics: any,
    format: ExportFormat,
    options: ExportOptions
  ): Promise<string> {
    const reportData = this.prepareAnalyticsData(analytics);
    const exportOptions = {
      ...options,
      customHeaders: {
        title: 'GAIming Analytics Report',
        ...options.customHeaders,
      },
    };

    switch (format) {
      case 'csv':
        return this.exportToCSV(reportData, exportOptions);
      case 'excel':
        return this.exportToExcel(reportData, exportOptions);
      case 'pdf':
        return this.exportToPDF(reportData, exportOptions);
      case 'json':
        return this.exportToJSON(reportData, exportOptions);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async exportModelsData(
    models: any[],
    format: ExportFormat,
    options: ExportOptions
  ): Promise<string> {
    const modelsData = this.prepareModelsData(models);
    const exportOptions = {
      ...options,
      customHeaders: {
        title: 'GAIming ML Models Report',
        ...options.customHeaders,
      },
    };

    switch (format) {
      case 'csv':
        return this.exportToCSV(modelsData, exportOptions);
      case 'excel':
        return this.exportToExcel(modelsData, exportOptions);
      case 'pdf':
        return this.exportToPDF(modelsData, exportOptions);
      case 'json':
        return this.exportToJSON(modelsData, exportOptions);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // Progress tracking methods

  private createExportJob(totalRecords: number): string {
    const jobId = `export_${++this.jobCounter}_${Date.now()}`;
    const job: ExportJob = {
      id: jobId,
      status: 'queued',
      progress: {
        stage: 'preparing',
        progress: 0,
        processedRecords: 0,
        totalRecords,
        message: 'Initializing export...'
      },
      startTime: new Date()
    };
    this.activeJobs.set(jobId, job);
    return jobId;
  }

  private updateProgress(
    jobId: string,
    progress: ExportProgress,
    onProgress?: (progress: ExportProgress) => void
  ): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.progress = progress;
      job.status = progress.stage === 'completed' ? 'completed' :
                   progress.stage === 'error' ? 'failed' : 'running';

      if (progress.stage === 'completed' || progress.stage === 'error') {
        job.endTime = new Date();
      }

      if (onProgress) {
        onProgress(progress);
      }
    }
  }

  getExportJob(jobId: string): ExportJob | undefined {
    return this.activeJobs.get(jobId);
  }

  cancelExport(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job && job.status === 'running') {
      job.status = 'cancelled';
      job.endTime = new Date();
    }
  }

  private calculateETA(jobId: string, processedRecords: number, totalRecords: number): number | undefined {
    const job = this.activeJobs.get(jobId);
    if (!job || processedRecords === 0) return undefined;

    const elapsedTime = Date.now() - job.startTime.getTime();
    const recordsPerMs = processedRecords / elapsedTime;
    const remainingRecords = totalRecords - processedRecords;

    return Math.round(remainingRecords / recordsPerMs);
  }

  // Private helper methods

  private generateFilename(extension: string, options: ExportOptions): string {
    const base = options.filename || 'export';
    const timestamp = options.includeTimestamp !== false 
      ? `-${new Date().toISOString().split('T')[0]}` 
      : '';
    return `${base}${timestamp}.${extension}`;
  }

  private async convertToCSVWithProgress(
    data: any[],
    options: ExportOptions,
    jobId: string
  ): Promise<string> {
    const chunkSize = options.chunkSize || 1000;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    // Add metadata if requested
    if (options.includeMetadata) {
      csvRows.unshift('# Export Metadata');
      csvRows.unshift(`# Exported at: ${new Date().toISOString()}`);
      csvRows.unshift(`# Total records: ${data.length}`);
      csvRows.unshift('');
    }

    // Process data in chunks for better performance and progress tracking
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      // Process chunk
      chunk.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        });
        csvRows.push(values.join(','));
      });

      // Update progress
      const processedRecords = Math.min(i + chunkSize, data.length);
      const progress = Math.round((processedRecords / data.length) * 65) + 25; // 25-90% range

      this.updateProgress(jobId, {
        stage: 'processing',
        progress,
        processedRecords,
        totalRecords: data.length,
        message: `Processing records ${i + 1}-${processedRecords} of ${data.length}...`,
        estimatedTimeRemaining: this.calculateETA(jobId, processedRecords, data.length)
      }, options.onProgress);

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    return csvRows.join('\n');
  }



  private convertToPDF(data: any[], options: ExportOptions): string {
    const title = options.customHeaders?.title || 'GAIming Export Report';
    const content = [
      title,
      '='.repeat(title.length),
      '',
      `Generated: ${new Date().toLocaleString()}`,
      `Records: ${data.length}`,
      '',
    ];

    data.forEach((row, index) => {
      content.push(`Record ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        content.push(`  ${key}: ${value}`);
      });
      content.push('');
    });

    return content.join('\n');
  }

  private convertToJSON(data: any[], _options: ExportOptions): string {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: data.length,
        source: 'GAIming Platform',
      },
      data,
    };

    return JSON.stringify(exportData, null, 2);
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  private prepareAnalyticsData(analytics: any): any[] {
    return [
      {
        'Metric': 'Total Players',
        'Value': analytics.overview?.totalPlayers || 0,
        'Category': 'Overview'
      },
      {
        'Metric': 'Active Players',
        'Value': analytics.overview?.activePlayers || 0,
        'Category': 'Overview'
      },
      {
        'Metric': 'Total Revenue',
        'Value': analytics.overview?.totalRevenue || 0,
        'Category': 'Revenue'
      },
      {
        'Metric': 'Average CTR',
        'Value': `${(analytics.overview?.averageCTR || 0).toFixed(2)}%`,
        'Category': 'Performance'
      },
      {
        'Metric': 'System Health',
        'Value': `${(analytics.overview?.systemHealth || 0).toFixed(2)}%`,
        'Category': 'System'
      },
    ];
  }

  private sanitizePlayerData(players: any[], includeSensitiveData: boolean): any[] {
    return players.map(player => {
      const sanitized: any = {
        'Player ID': player.playerId,
        'Username': player.username,
        'VIP Level': player.vipLevel,
        'Player Segment': player.playerSegment,
        'Total Sessions': player.totalSessions,
        'Registration Date': player.registrationDate,
        'Status': player.isActive ? 'Active' : 'Inactive',
      };

      if (includeSensitiveData) {
        sanitized['Email'] = player.email;
        sanitized['Total Revenue'] = player.totalRevenue;
        sanitized['Risk Level'] = player.riskLevel;
      }

      return sanitized;
    });
  }

  private prepareModelsData(models: any[]): any[] {
    return models.map(model => ({
      'Model ID': model.id,
      'Name': model.name,
      'Version': model.version,
      'Type': model.modelType,
      'Status': model.status,
      'Created Date': model.createdDate,
      'Last Trained': model.lastTrainedDate || 'Never',
      'Is Active': model.isActive ? 'Yes' : 'No',
    }));
  }
}

// Create singleton instance
export const exportService = new ExportService();
export default exportService;
