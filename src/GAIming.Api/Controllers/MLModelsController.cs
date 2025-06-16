using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GAIming.Core.Models;
using GAIming.Core.Interfaces;

namespace GAIming.Api.Controllers;

/// <summary>
/// Controller for ML models management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MLModelsController : ControllerBase
{
    private readonly ILogger<MLModelsController> _logger;

    public MLModelsController(ILogger<MLModelsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets paginated list of ML models
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20)</param>
    /// <param name="search">Search term for model name or description</param>
    /// <param name="modelType">Model type filter</param>
    /// <param name="status">Status filter</param>
    /// <param name="algorithm">Algorithm filter</param>
    /// <param name="createdBy">Created by filter</param>
    /// <param name="sortBy">Sort field (default: createdDate)</param>
    /// <param name="sortDirection">Sort direction (asc/desc, default: desc)</param>
    /// <returns>Paginated list of ML models</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<MLModel>), StatusCodes.Status200OK)]
    public IActionResult GetModels(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? modelType = null,
        [FromQuery] string? status = null,
        [FromQuery] string? algorithm = null,
        [FromQuery] string? createdBy = null,
        [FromQuery] string sortBy = "createdDate",
        [FromQuery] string sortDirection = "desc")
    {
        try
        {
            _logger.LogInformation("Getting ML models - Page: {Page}, PageSize: {PageSize}, Search: {Search}",
                page, pageSize, search);

            // Mock ML models data
            var mockModels = new List<MLModel>
            {
                new MLModel
                {
                    Id = 1,
                    Name = "Collaborative Filtering Model",
                    Description = "User-based collaborative filtering for game recommendations",
                    ModelType = "Recommendation",
                    Version = "1.2.0",
                    Status = "deployed",
                    FilePath = "/models/collaborative_v1.2.pkl",
                    Configuration = new Dictionary<string, object> 
                    { 
                        { "neighbors", 50 }, 
                        { "similarity", "cosine" } 
                    },
                    Metadata = new Dictionary<string, object> 
                    { 
                        { "accuracy", 0.85 }, 
                        { "training_time", "2h 15m" } 
                    },
                    CreatedDate = DateTime.UtcNow.AddDays(-30),
                    LastTrainedDate = DateTime.UtcNow.AddDays(-7),
                    DeployedDate = DateTime.UtcNow.AddDays(-5),
                    CreatedBy = "data-scientist@gaiming.com",
                    IsActive = true
                },
                new MLModel
                {
                    Id = 2,
                    Name = "Content-Based Filtering Model",
                    Description = "Game feature-based content filtering model",
                    ModelType = "Recommendation",
                    Version = "2.1.0",
                    Status = "training",
                    Configuration = new Dictionary<string, object> 
                    { 
                        { "features", new[] { "genre", "provider", "volatility" } },
                        { "algorithm", "random_forest" }
                    },
                    Metadata = new Dictionary<string, object> 
                    { 
                        { "progress", 0.75 }, 
                        { "estimated_completion", "30 minutes" } 
                    },
                    CreatedDate = DateTime.UtcNow.AddDays(-15),
                    LastTrainedDate = DateTime.UtcNow.AddHours(-2),
                    CreatedBy = "ml-engineer@gaiming.com",
                    IsActive = true
                },
                new MLModel
                {
                    Id = 3,
                    Name = "Player Risk Assessment Model",
                    Description = "Deep learning model for player risk scoring",
                    ModelType = "Classification",
                    Version = "1.0.0",
                    Status = "trained",
                    FilePath = "/models/risk_assessment_v1.0.h5",
                    Configuration = new Dictionary<string, object> 
                    { 
                        { "layers", 3 }, 
                        { "neurons", new[] { 128, 64, 32 } },
                        { "activation", "relu" }
                    },
                    Metadata = new Dictionary<string, object> 
                    { 
                        { "f1_score", 0.92 }, 
                        { "precision", 0.89 },
                        { "recall", 0.95 }
                    },
                    CreatedDate = DateTime.UtcNow.AddDays(-45),
                    LastTrainedDate = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = "risk-analyst@gaiming.com",
                    IsActive = true
                }
            };

            var filteredModels = mockModels.AsQueryable();

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                filteredModels = filteredModels.Where(m =>
                    m.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    m.Description.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            // Apply other filters
            if (!string.IsNullOrEmpty(modelType))
                filteredModels = filteredModels.Where(m => m.ModelType == modelType);

            if (!string.IsNullOrEmpty(status))
                filteredModels = filteredModels.Where(m => m.Status == status);

            if (!string.IsNullOrEmpty(createdBy))
                filteredModels = filteredModels.Where(m => m.CreatedBy == createdBy);

            var totalCount = filteredModels.Count();
            var models = filteredModels.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var paginatedData = new PaginatedResponse<MLModel>
            {
                Items = models,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            var response = new
            {
                data = paginatedData,
                success = true,
                message = "ML models retrieved successfully"
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ML models");
            return StatusCode(500, "An error occurred while getting ML models");
        }
    }

    /// <summary>
    /// Gets ML model by ID
    /// </summary>
    /// <param name="id">Model identifier</param>
    /// <returns>ML model details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MLModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetModel(long id)
    {
        try
        {
            _logger.LogInformation("Getting ML model {ModelId}", id);

            if (id <= 0)
            {
                return BadRequest("Invalid model ID");
            }

            // Mock model data - in real implementation, this would come from database
            var model = new MLModel
            {
                Id = id,
                Name = $"ML Model {id}",
                Description = $"Description for ML model {id}",
                ModelType = "Recommendation",
                Version = "1.0.0",
                Status = "deployed",
                FilePath = $"/models/model_{id}.pkl",
                Configuration = new Dictionary<string, object> { { "param1", "value1" } },
                Metadata = new Dictionary<string, object> { { "accuracy", 0.85 } },
                CreatedDate = DateTime.UtcNow.AddDays(-30),
                LastTrainedDate = DateTime.UtcNow.AddDays(-7),
                DeployedDate = DateTime.UtcNow.AddDays(-5),
                CreatedBy = "system@gaiming.com",
                IsActive = true
            };

            return Ok(model);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ML model {ModelId}", id);
            return StatusCode(500, "An error occurred while getting the ML model");
        }
    }

    /// <summary>
    /// Creates a new ML model
    /// </summary>
    /// <param name="request">Create model request</param>
    /// <returns>Created ML model</returns>
    [HttpPost]
    [ProducesResponseType(typeof(MLModel), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CreateModel([FromBody] CreateMLModelRequest request)
    {
        try
        {
            _logger.LogInformation("Creating ML model: {ModelName}", request.Name);

            if (string.IsNullOrEmpty(request.Name))
            {
                return BadRequest("Model name is required");
            }

            // Mock creation - in real implementation, this would save to database
            var model = new MLModel
            {
                Id = new Random().Next(1000, 9999),
                Name = request.Name,
                Description = request.Description,
                ModelType = request.ModelType,
                Version = "1.0.0",
                Status = "created",
                Configuration = request.Configuration,
                Metadata = request.Metadata,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "current-user@gaiming.com",
                IsActive = true
            };

            return CreatedAtAction(nameof(GetModel), new { id = model.Id }, model);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating ML model");
            return StatusCode(500, "An error occurred while creating the ML model");
        }
    }

    /// <summary>
    /// Updates an existing ML model
    /// </summary>
    /// <param name="id">Model identifier</param>
    /// <param name="request">Update model request</param>
    /// <returns>Updated ML model</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MLModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult UpdateModel(long id, [FromBody] UpdateMLModelRequest request)
    {
        try
        {
            _logger.LogInformation("Updating ML model {ModelId}", id);

            if (id <= 0)
            {
                return BadRequest("Invalid model ID");
            }

            // Mock update - in real implementation, this would update in database
            var model = new MLModel
            {
                Id = id,
                Name = request.Name ?? $"ML Model {id}",
                Description = request.Description ?? $"Updated description for model {id}",
                ModelType = "Recommendation",
                Version = request.Version ?? "1.0.1",
                Status = "updated",
                Configuration = request.Configuration,
                Metadata = request.Metadata,
                CreatedDate = DateTime.UtcNow.AddDays(-30),
                LastTrainedDate = DateTime.UtcNow,
                CreatedBy = "system@gaiming.com",
                IsActive = request.IsActive ?? true
            };

            return Ok(model);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating ML model {ModelId}", id);
            return StatusCode(500, "An error occurred while updating the ML model");
        }
    }

    /// <summary>
    /// Deletes an ML model
    /// </summary>
    /// <param name="id">Model identifier</param>
    /// <returns>Success response</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteModel(long id)
    {
        try
        {
            _logger.LogInformation("Deleting ML model {ModelId}", id);

            if (id <= 0)
            {
                return BadRequest("Invalid model ID");
            }

            // Mock deletion - in real implementation, this would delete from database
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting ML model {ModelId}", id);
            return StatusCode(500, "An error occurred while deleting the ML model");
        }
    }

    /// <summary>
    /// Gets model performance metrics
    /// </summary>
    /// <param name="id">Model identifier</param>
    /// <returns>Model performance metrics</returns>
    [HttpGet("{id}/performance")]
    [ProducesResponseType(typeof(ModelPerformanceMetrics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetModelPerformance(long id)
    {
        try
        {
            _logger.LogInformation("Getting performance metrics for ML model {ModelId}", id);

            if (id <= 0)
            {
                return BadRequest("Invalid model ID");
            }

            // Mock performance metrics
            var metrics = new ModelPerformanceMetrics
            {
                ModelName = $"ML Model {id}",
                Version = "1.0.0",
                EvaluationDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Precision = 0.85,
                Recall = 0.82,
                F1Score = 0.835,
                Auc = 0.91,
                Ndcg = 0.78,
                Map = 0.73,
                Coverage = 0.65,
                Diversity = 0.42,
                Novelty = 0.38,
                CustomMetrics = new Dictionary<string, double>
                {
                    { "click_through_rate", 0.15 },
                    { "conversion_rate", 0.08 },
                    { "revenue_per_recommendation", 2.45 }
                }
            };

            var response = new
            {
                data = metrics,
                success = true,
                message = "Model performance metrics retrieved successfully"
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting performance metrics for ML model {ModelId}", id);
            return StatusCode(500, "An error occurred while getting model performance metrics");
        }
    }

    /// <summary>
    /// Trains an ML model
    /// </summary>
    /// <param name="id">Model identifier</param>
    /// <param name="request">Training request parameters</param>
    /// <returns>Training job information</returns>
    [HttpPost("{id}/train")]
    [ProducesResponseType(typeof(ModelTrainingJob), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult TrainModel(long id, [FromBody] TrainingRequest request)
    {
        try
        {
            _logger.LogInformation("Starting training for ML model {ModelId}", id);

            if (id <= 0)
            {
                return BadRequest("Invalid model ID");
            }

            // Mock training job response
            var trainingJob = new ModelTrainingJob
            {
                Id = new Random().Next(1000, 9999),
                ModelId = id,
                ModelName = $"ML Model {id}",
                Status = "queued",
                Progress = 0,
                StartTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                TrainingData = new TrainingDataInfo
                {
                    DatasetSize = 100000,
                    TrainingSize = 70000,
                    ValidationSize = 20000,
                    TestSize = 10000,
                    Features = new List<string> { "user_id", "game_id", "rating", "timestamp" },
                    TargetVariable = "rating",
                    DataQuality = new DataQualityMetrics
                    {
                        Completeness = 0.95,
                        Consistency = 0.92,
                        Accuracy = 0.88,
                        Validity = 0.94,
                        Uniqueness = 0.99,
                        MissingValues = 5000,
                        Outliers = 1200
                    }
                },
                Hyperparameters = request.Hyperparameters ?? new Dictionary<string, object>
                {
                    { "learning_rate", 0.001 },
                    { "batch_size", 32 },
                    { "epochs", 100 }
                },
                Logs = new List<string>
                {
                    "Training job queued successfully",
                    "Preparing training data...",
                    "Initializing model parameters..."
                }
            };

            return Accepted(trainingJob);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting training for ML model {ModelId}", id);
            return StatusCode(500, "An error occurred while starting model training");
        }
    }

    /// <summary>
    /// Deploys an ML model
    /// </summary>
    /// <param name="id">Model identifier</param>
    /// <param name="request">Deployment request parameters</param>
    /// <returns>Deployment information</returns>
    [HttpPost("{id}/deploy")]
    [ProducesResponseType(typeof(ModelDeployment), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeployModel(long id, [FromBody] DeploymentRequest request)
    {
        try
        {
            _logger.LogInformation("Deploying ML model {ModelId}", id);

            if (id <= 0)
            {
                return BadRequest("Invalid model ID");
            }

            // Mock deployment response
            var deployment = new ModelDeployment
            {
                Id = new Random().Next(1000, 9999),
                ModelId = id,
                ModelName = $"ML Model {id}",
                Version = "1.0.0",
                Environment = request.Environment,
                Status = "deploying",
                DeployedDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                DeployedBy = "current-user@gaiming.com",
                Configuration = request.Configuration,
                HealthCheck = new GAIming.Core.Models.HealthCheckResult
                {
                    Status = "healthy",
                    LastCheck = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    ResponseTime = 45.2,
                    ErrorRate = 0.001,
                    Uptime = 99.95
                },
                Metrics = new DeploymentMetrics
                {
                    RequestsPerSecond = 150.5,
                    AverageResponseTime = 42.3,
                    ErrorRate = 0.002,
                    CpuUsage = 35.7,
                    MemoryUsage = 68.4,
                    Throughput = 1250.8
                }
            };

            return Accepted(deployment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deploying ML model {ModelId}", id);
            return StatusCode(500, "An error occurred while deploying the ML model");
        }
    }
}
