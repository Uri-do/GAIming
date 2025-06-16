import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001/api';

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  includeAnalytics: boolean;
  includePlayerData: boolean;
  includeRecommendations: boolean;
  dateRange: string;
  gameIds?: number[];
  providerIds?: number[];
  gameTypes?: string[];
}

export interface ImportResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  warnings: string[];
  duplicates: number;
}

export interface ExportHistory {
  id: number;
  filename: string;
  format: string;
  size: string;
  createdAt: string;
  createdBy: string;
  downloadCount: number;
  downloadUrl: string;
}

class GameFileService {
  /**
   * Export games data
   */
  async exportGames(options: ExportOptions): Promise<Blob> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/GamesManagement/export`,
        options,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export games data');
    }
  }

  /**
   * Import games data from file
   */
  async importGames(
    file: File,
    options?: {
      updateExisting?: boolean;
      skipDuplicates?: boolean;
      validateOnly?: boolean;
    }
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options) {
        formData.append('options', JSON.stringify(options));
      }

      const response = await axios.post(
        `${API_BASE_URL}/GamesManagement/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              // You can emit this to a progress callback if needed
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import games data');
    }
  }

  /**
   * Get export history
   */
  async getExportHistory(page = 1, limit = 10): Promise<{
    exports: ExportHistory[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/GamesManagement/export-history`,
        {
          params: { page, limit },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      throw new Error('Failed to fetch export history');
    }
  }

  /**
   * Download export file by ID
   */
  async downloadExport(exportId: number): Promise<Blob> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/GamesManagement/export/${exportId}/download`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download export file');
    }
  }

  /**
   * Get import template
   */
  async getImportTemplate(format: 'csv' | 'xlsx' | 'json'): Promise<Blob> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/GamesManagement/import-template`,
        {
          params: { format },
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get template:', error);
      throw new Error('Failed to get import template');
    }
  }

  /**
   * Validate import file without importing
   */
  async validateImportFile(file: File): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    previewData: any[];
    totalRows: number;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/GamesManagement/validate-import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Validation failed:', error);
      throw new Error('Failed to validate import file');
    }
  }

  /**
   * Get supported file formats and limits
   */
  getFileConstraints() {
    return {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      supportedFormats: {
        csv: {
          mimeTypes: ['text/csv', 'application/csv'],
          extensions: ['.csv'],
          description: 'Comma-separated values'
        },
        xlsx: {
          mimeTypes: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          extensions: ['.xlsx'],
          description: 'Excel spreadsheet'
        },
        json: {
          mimeTypes: ['application/json'],
          extensions: ['.json'],
          description: 'JSON data format'
        }
      },
      requiredColumns: [
        'GameName',
        'ProviderName',
        'GameType',
        'IsActive',
        'MinBetAmount',
        'MaxBetAmount',
        'RtpPercentage'
      ],
      optionalColumns: [
        'GameID',
        'GameDescription',
        'VolatilityName',
        'ThemeName',
        'IsMobile',
        'IsDesktop',
        'IsNewGame',
        'HideInLobby',
        'GameOrder',
        'ReleaseDate',
        'Tags'
      ]
    };
  }

  /**
   * Generate filename for export
   */
  generateExportFilename(format: string, options: ExportOptions): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const prefix = 'games_export';
    
    let suffix = '';
    if (options.includeAnalytics) suffix += '_analytics';
    if (options.includePlayerData) suffix += '_players';
    if (options.includeRecommendations) suffix += '_recommendations';
    
    return `${prefix}${suffix}_${timestamp}.${format}`;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const constraints = this.getFileConstraints();
    const errors: string[] = [];

    // Check file size
    if (file.size > constraints.maxFileSize) {
      errors.push(`File size exceeds maximum limit of ${this.formatFileSize(constraints.maxFileSize)}`);
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidFormat = Object.values(constraints.supportedFormats).some(
      format => 
        format.mimeTypes.includes(file.type) || 
        format.extensions.includes(fileExtension)
    );

    if (!isValidFormat) {
      errors.push('Unsupported file format. Please use CSV, Excel (.xlsx), or JSON files.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const gameFileService = new GameFileService();
export default gameFileService;
