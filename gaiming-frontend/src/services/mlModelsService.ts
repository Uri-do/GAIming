import { api } from './api';
import type { ApiResponse, PaginatedResponse, ModelPerformanceMetrics } from '../types';

// ML Models Types
export interface MLModel {
  id: number;
  name: string;
  description: string;
  modelType: string;
  version: string;
  status: 'training' | 'trained' | 'deployed' | 'retired' | 'failed';
  filePath?: string;
  configuration: Record<string, any>;
  metadata: Record<string, any>;
  createdDate: string;
  lastTrainedDate?: string;
  deployedDate?: string;
  createdBy: string;
  isActive: boolean;
}

export interface ModelTrainingJob {
  id: number;
  modelId: number;
  modelName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  trainingData: TrainingDataInfo;
  hyperparameters: Record<string, any>;
  metrics?: ModelPerformanceMetrics;
  logs: string[];
  errorMessage?: string;
}

export interface TrainingDataInfo {
  datasetSize: number;
  trainingSize: number;
  validationSize: number;
  testSize: number;
  features: string[];
  targetVariable: string;
  dataQuality: DataQualityMetrics;
}

export interface DataQualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  validity: number;
  uniqueness: number;
  missingValues: number;
  outliers: number;
}

export interface ModelDeployment {
  id: number;
  modelId: number;
  modelName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'deploying' | 'deployed' | 'failed' | 'rollback';
  deployedDate: string;
  deployedBy: string;
  configuration: DeploymentConfiguration;
  healthCheck: HealthCheckResult;
  metrics: DeploymentMetrics;
}

export interface DeploymentConfiguration {
  replicas: number;
  cpuLimit: string;
  memoryLimit: string;
  autoScaling: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetCpuUtilization: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  responseTime: number;
  errorRate: number;
  uptime: number;
}

export interface DeploymentMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  throughput: number;
}

export interface ModelComparison {
  models: ModelComparisonItem[];
  comparisonMetrics: string[];
  winner?: number;
  recommendations: string[];
}

export interface ModelComparisonItem {
  modelId: number;
  modelName: string;
  version: string;
  algorithm: string;
  metrics: Record<string, number>;
  rank: number;
  isWinner: boolean;
}

export interface ABTestResult {
  id: number;
  testName: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'running' | 'completed' | 'paused' | 'cancelled';
  models: ABTestModel[];
  trafficSplit: Record<string, number>;
  metrics: ABTestMetrics;
  winner?: number;
  confidenceLevel: number;
  isStatisticallySignificant: boolean;
}

export interface ABTestModel {
  modelId: number;
  modelName: string;
  version: string;
  trafficPercentage: number;
  metrics: Record<string, number>;
}

export interface ABTestMetrics {
  totalUsers: number;
  totalRecommendations: number;
  overallCTR: number;
  overallConversionRate: number;
  revenueImpact: number;
  statisticalSignificance: number;
}

export interface ModelMonitoring {
  modelId: number;
  modelName: string;
  version: string;
  monitoringPeriod: string;
  alerts: ModelAlert[];
  driftDetection: DriftDetection;
  performanceDegradation: PerformanceDegradation;
  dataQuality: DataQualityMonitoring;
}

export interface ModelAlert {
  id: number;
  type: 'performance' | 'drift' | 'error' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface DriftDetection {
  hasDrift: boolean;
  driftScore: number;
  driftType: 'feature' | 'prediction' | 'concept';
  affectedFeatures: string[];
  detectionDate: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PerformanceDegradation {
  hasPerformanceDrop: boolean;
  currentPerformance: number;
  baselinePerformance: number;
  degradationPercentage: number;
  affectedMetrics: string[];
  detectionDate: string;
}

export interface DataQualityMonitoring {
  overallScore: number;
  issues: DataQualityIssue[];
  trends: DataQualityTrend[];
}

export interface DataQualityIssue {
  type: string;
  severity: string;
  description: string;
  affectedRecords: number;
  detectionDate: string;
}

export interface DataQualityTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'degrading';
  currentValue: number;
  previousValue: number;
  changePercentage: number;
}

export interface ModelRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  modelType?: string;
  status?: string;
  algorithm?: string;
  createdBy?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TrainingRequest {
  modelId: number;
  hyperparameters?: Record<string, any>;
  datasetConfig?: Record<string, any>;
  trainingConfig?: Record<string, any>;
}

export interface DeploymentRequest {
  modelId: number;
  environment: string;
  configuration: DeploymentConfiguration;
}

class MLModelsService {
  private readonly baseUrl = '/api/MLModels';

  async getModels(request: ModelRequest = {}): Promise<PaginatedResponse<MLModel>> {
    const params = new URLSearchParams();
    
    if (request.page) params.append('page', request.page.toString());
    if (request.pageSize) params.append('pageSize', request.pageSize.toString());
    if (request.search) params.append('search', request.search);
    if (request.modelType) params.append('modelType', request.modelType);
    if (request.status) params.append('status', request.status);
    if (request.algorithm) params.append('algorithm', request.algorithm);
    if (request.createdBy) params.append('createdBy', request.createdBy);
    if (request.sortBy) params.append('sortBy', request.sortBy);
    if (request.sortDirection) params.append('sortDirection', request.sortDirection);

    const response = await api.get<ApiResponse<PaginatedResponse<MLModel>>>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data.data;
  }

  async getModel(id: number): Promise<MLModel> {
    const response = await api.get<ApiResponse<MLModel>>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async createModel(model: Partial<MLModel>): Promise<MLModel> {
    const response = await api.post<ApiResponse<MLModel>>(`${this.baseUrl}`, model);
    return response.data.data;
  }

  async updateModel(id: number, model: Partial<MLModel>): Promise<MLModel> {
    const response = await api.put<ApiResponse<MLModel>>(`${this.baseUrl}/${id}`, model);
    return response.data.data;
  }

  async deleteModel(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async getModelPerformance(id: number): Promise<ModelPerformanceMetrics> {
    const response = await api.get<ApiResponse<ModelPerformanceMetrics>>(
      `${this.baseUrl}/${id}/performance`
    );
    return response.data.data;
  }

  async trainModel(request: TrainingRequest): Promise<ModelTrainingJob> {
    const response = await api.post<ApiResponse<ModelTrainingJob>>(
      `${this.baseUrl}/${request.modelId}/train`,
      request
    );
    return response.data.data;
  }

  async getTrainingJobs(modelId?: number): Promise<ModelTrainingJob[]> {
    const url = modelId 
      ? `${this.baseUrl}/${modelId}/training-jobs`
      : `${this.baseUrl}/training-jobs`;
    
    const response = await api.get<ApiResponse<ModelTrainingJob[]>>(url);
    return response.data.data;
  }

  async getTrainingJob(jobId: number): Promise<ModelTrainingJob> {
    const response = await api.get<ApiResponse<ModelTrainingJob>>(
      `${this.baseUrl}/training-jobs/${jobId}`
    );
    return response.data.data;
  }

  async deployModel(request: DeploymentRequest): Promise<ModelDeployment> {
    const response = await api.post<ApiResponse<ModelDeployment>>(
      `${this.baseUrl}/${request.modelId}/deploy`,
      request
    );
    return response.data.data;
  }

  async getDeployments(modelId?: number): Promise<ModelDeployment[]> {
    const url = modelId 
      ? `${this.baseUrl}/${modelId}/deployments`
      : `${this.baseUrl}/deployments`;
    
    const response = await api.get<ApiResponse<ModelDeployment[]>>(url);
    return response.data.data;
  }

  async compareModels(modelIds: number[]): Promise<ModelComparison> {
    const response = await api.post<ApiResponse<ModelComparison>>(
      `${this.baseUrl}/compare`,
      { modelIds }
    );
    return response.data.data;
  }

  async getABTests(): Promise<ABTestResult[]> {
    const response = await api.get<ApiResponse<ABTestResult[]>>(`${this.baseUrl}/ab-tests`);
    return response.data.data;
  }

  async createABTest(test: Partial<ABTestResult>): Promise<ABTestResult> {
    const response = await api.post<ApiResponse<ABTestResult>>(`${this.baseUrl}/ab-tests`, test);
    return response.data.data;
  }

  async getModelMonitoring(modelId: number): Promise<ModelMonitoring> {
    const response = await api.get<ApiResponse<ModelMonitoring>>(
      `${this.baseUrl}/${modelId}/monitoring`
    );
    return response.data.data;
  }
}

export const mlModelsService = new MLModelsService();
