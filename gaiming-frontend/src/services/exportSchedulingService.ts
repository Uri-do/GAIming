import { api } from './api';
import type { ApiResponse } from '../types';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type ExportType = 'players' | 'analytics' | 'models' | 'comprehensive';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportSchedule {
  id: string;
  name: string;
  description?: string;
  exportType: ExportType;
  format: ExportFormat;
  frequency: ScheduleFrequency;
  isActive: boolean;
  nextRunDate: string;
  lastRunDate?: string;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  
  // Schedule configuration
  scheduleConfig: ScheduleConfig;
  
  // Export configuration
  exportConfig: ExportConfig;
  
  // Delivery configuration
  deliveryConfig: DeliveryConfig;
  
  // Execution history
  executionHistory?: ScheduleExecution[];
}

export interface ScheduleConfig {
  // For daily: hour (0-23)
  hour?: number;
  
  // For weekly: dayOfWeek (0-6, 0=Sunday), hour
  dayOfWeek?: number;
  
  // For monthly: dayOfMonth (1-31), hour
  dayOfMonth?: number;
  
  // For quarterly: month (1-12), dayOfMonth, hour
  month?: number;
  
  // Timezone
  timezone: string;
}

export interface ExportConfig {
  // Data filters
  filters?: Record<string, any>;
  
  // Include sensitive data (admin only)
  includeSensitiveData?: boolean;
  
  // Custom filename template
  filenameTemplate?: string;
  
  // Include metadata
  includeMetadata?: boolean;
  
  // Custom headers
  customHeaders?: Record<string, string>;
}

export interface DeliveryConfig {
  // Email delivery
  emailDelivery?: {
    enabled: boolean;
    recipients: string[];
    subject?: string;
    body?: string;
  };
  
  // File storage
  fileStorage?: {
    enabled: boolean;
    path: string;
    retentionDays?: number;
  };
  
  // API webhook
  webhook?: {
    enabled: boolean;
    url: string;
    headers?: Record<string, string>;
  };
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  executionDate: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  recordsExported?: number;
  fileSize?: number;
  filePath?: string;
  errorMessage?: string;
  deliveryStatus?: {
    email?: 'pending' | 'sent' | 'failed';
    storage?: 'pending' | 'saved' | 'failed';
    webhook?: 'pending' | 'sent' | 'failed';
  };
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  exportType: ExportType;
  format: ExportFormat;
  frequency: ScheduleFrequency;
  scheduleConfig: ScheduleConfig;
  exportConfig: ExportConfig;
  deliveryConfig: DeliveryConfig;
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  isActive?: boolean;
}

export interface ScheduleListRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  exportType?: ExportType;
  frequency?: ScheduleFrequency;
  isActive?: boolean;
  createdBy?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

class ExportSchedulingService {
  private readonly baseUrl = '/api/ExportScheduling';

  async getSchedules(request: ScheduleListRequest = {}): Promise<{
    items: ExportSchedule[];
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const params = new URLSearchParams();
    
    if (request.page) params.append('page', request.page.toString());
    if (request.pageSize) params.append('pageSize', request.pageSize.toString());
    if (request.search) params.append('search', request.search);
    if (request.exportType) params.append('exportType', request.exportType);
    if (request.frequency) params.append('frequency', request.frequency);
    if (request.isActive !== undefined) params.append('isActive', request.isActive.toString());
    if (request.createdBy) params.append('createdBy', request.createdBy);
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortDirection) params.append('sortDirection', request.sortDirection);

    const response = await api.get<ApiResponse<any>>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data.data;
  }

  async getSchedule(id: string): Promise<ExportSchedule> {
    const response = await api.get<ApiResponse<ExportSchedule>>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async createSchedule(request: CreateScheduleRequest): Promise<ExportSchedule> {
    const response = await api.post<ApiResponse<ExportSchedule>>(`${this.baseUrl}`, request);
    return response.data.data;
  }

  async updateSchedule(id: string, request: UpdateScheduleRequest): Promise<ExportSchedule> {
    const response = await api.put<ApiResponse<ExportSchedule>>(`${this.baseUrl}/${id}`, request);
    return response.data.data;
  }

  async deleteSchedule(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async toggleSchedule(id: string, isActive: boolean): Promise<ExportSchedule> {
    const response = await api.patch<ApiResponse<ExportSchedule>>(
      `${this.baseUrl}/${id}/toggle`,
      { isActive }
    );
    return response.data.data;
  }

  async executeScheduleNow(id: string): Promise<ScheduleExecution> {
    const response = await api.post<ApiResponse<ScheduleExecution>>(
      `${this.baseUrl}/${id}/execute`
    );
    return response.data.data;
  }

  async getScheduleExecutions(
    scheduleId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    items: ScheduleExecution[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await api.get<ApiResponse<any>>(
      `${this.baseUrl}/${scheduleId}/executions?page=${page}&pageSize=${pageSize}`
    );
    return response.data.data;
  }

  async getExecution(executionId: string): Promise<ScheduleExecution> {
    const response = await api.get<ApiResponse<ScheduleExecution>>(
      `${this.baseUrl}/executions/${executionId}`
    );
    return response.data.data;
  }

  async cancelExecution(executionId: string): Promise<void> {
    await api.post(`${this.baseUrl}/executions/${executionId}/cancel`);
  }

  async downloadExecutionFile(executionId: string): Promise<Blob> {
    const response = await api.get<Blob>(
      `${this.baseUrl}/executions/${executionId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Helper methods for schedule configuration
  generateCronExpression(frequency: ScheduleFrequency, config: ScheduleConfig): string {
    const { hour = 0, dayOfWeek = 0, dayOfMonth = 1, month = 1 } = config;
    
    switch (frequency) {
      case 'daily':
        return `0 ${hour} * * *`;
      case 'weekly':
        return `0 ${hour} * * ${dayOfWeek}`;
      case 'monthly':
        return `0 ${hour} ${dayOfMonth} * *`;
      case 'quarterly':
        return `0 ${hour} ${dayOfMonth} ${month}/3 *`;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  calculateNextRunDate(frequency: ScheduleFrequency, config: ScheduleConfig): Date {
    const now = new Date();
    const next = new Date(now);
    
    // Set the time
    next.setHours(config.hour || 0, 0, 0, 0);
    
    switch (frequency) {
      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;
        
      case 'weekly':
        const targetDay = config.dayOfWeek || 0;
        const currentDay = next.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        
        if (daysUntilTarget === 0 && next <= now) {
          next.setDate(next.getDate() + 7);
        } else {
          next.setDate(next.getDate() + daysUntilTarget);
        }
        break;
        
      case 'monthly':
        next.setDate(config.dayOfMonth || 1);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;
        
      case 'quarterly':
        const targetMonth = (config.month || 1) - 1; // 0-based
        const currentMonth = next.getMonth();
        const monthsUntilTarget = (targetMonth - currentMonth + 12) % 12;
        
        next.setMonth(currentMonth + monthsUntilTarget);
        next.setDate(config.dayOfMonth || 1);
        
        if (next <= now) {
          next.setMonth(next.getMonth() + 3);
        }
        break;
    }
    
    return next;
  }

  validateScheduleConfig(frequency: ScheduleFrequency, config: ScheduleConfig): string[] {
    const errors: string[] = [];
    
    if (config.hour !== undefined && (config.hour < 0 || config.hour > 23)) {
      errors.push('Hour must be between 0 and 23');
    }
    
    if (frequency === 'weekly' && config.dayOfWeek !== undefined) {
      if (config.dayOfWeek < 0 || config.dayOfWeek > 6) {
        errors.push('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }
    }
    
    if ((frequency === 'monthly' || frequency === 'quarterly') && config.dayOfMonth !== undefined) {
      if (config.dayOfMonth < 1 || config.dayOfMonth > 31) {
        errors.push('Day of month must be between 1 and 31');
      }
    }
    
    if (frequency === 'quarterly' && config.month !== undefined) {
      if (config.month < 1 || config.month > 12) {
        errors.push('Month must be between 1 and 12');
      }
    }
    
    return errors;
  }
}

export const exportSchedulingService = new ExportSchedulingService();
export default exportSchedulingService;
