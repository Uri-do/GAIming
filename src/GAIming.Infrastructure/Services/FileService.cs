using Microsoft.Extensions.Logging;
using GAIming.Core.Interfaces;
using GAIming.Core.Models;
using GAIming.Core.Common;

namespace GAIming.Infrastructure.Services;

/// <summary>
/// File service implementation
/// </summary>
public class FileService : IFileService
{
    private readonly ILogger<FileService> _logger;
    private readonly string _basePath;

    /// <summary>
    /// Initializes a new instance of the FileService
    /// </summary>
    public FileService(ILogger<FileService> logger)
    {
        _logger = logger;
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        
        // Ensure upload directory exists
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    /// <inheritdoc />
    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string? contentType = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var fileKey = Guid.NewGuid().ToString();
            var fileExtension = Path.GetExtension(fileName);
            var storedFileName = $"{fileKey}{fileExtension}";
            var filePath = Path.Combine(_basePath, storedFileName);

            using var fileStreamOutput = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);

            _logger.LogInformation("File uploaded successfully: {FileName} -> {FileKey}", fileName, fileKey);
            return fileKey;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file: {FileName}", fileName);
            throw;
        }
    }

    /// <inheritdoc />
    public Task<Stream> DownloadFileAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var files = Directory.GetFiles(_basePath, $"{fileKey}.*");
            if (files.Length == 0)
            {
                throw new FileNotFoundException($"File with key {fileKey} not found");
            }

            var filePath = files[0];
            var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);

            _logger.LogInformation("File downloaded: {FileKey}", fileKey);
            return Task.FromResult<Stream>(fileStream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download file: {FileKey}", fileKey);
            throw;
        }
    }

    /// <inheritdoc />
    public Task<bool> DeleteFileAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var files = Directory.GetFiles(_basePath, $"{fileKey}.*");
            if (files.Length == 0)
            {
                return Task.FromResult(false);
            }

            foreach (var file in files)
            {
                File.Delete(file);
            }

            _logger.LogInformation("File deleted: {FileKey}", fileKey);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file: {FileKey}", fileKey);
            return Task.FromResult(false);
        }
    }

    /// <inheritdoc />
    public Task<FileMetadata?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var files = Directory.GetFiles(_basePath, $"{fileKey}.*");
            if (files.Length == 0)
            {
                return Task.FromResult<FileMetadata?>(null);
            }

            var filePath = files[0];
            var fileInfo = new FileInfo(filePath);

            return Task.FromResult<FileMetadata?>(new FileMetadata
            {
                Key = fileKey,
                FileName = Path.GetFileName(filePath),
                Size = fileInfo.Length,
                UploadedAt = fileInfo.CreationTimeUtc,
                ContentType = GetContentType(fileInfo.Extension)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get file metadata: {FileKey}", fileKey);
            return Task.FromResult<FileMetadata?>(null);
        }
    }

    /// <inheritdoc />
    public Task<bool> FileExistsAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var files = Directory.GetFiles(_basePath, $"{fileKey}.*");
            return Task.FromResult(files.Length > 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check file existence: {FileKey}", fileKey);
            return Task.FromResult(false);
        }
    }



    /// <inheritdoc />
    public Task<PaginatedResponse<FileMetadata>> ListFilesAsync(int page = 1, int pageSize = 50, string? prefix = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var searchPattern = string.IsNullOrEmpty(prefix) ? "*.*" : $"{prefix}*.*";
            var files = Directory.GetFiles(_basePath, searchPattern);
            
            var fileMetadataList = new List<FileMetadata>();

            foreach (var filePath in files)
            {
                var fileInfo = new FileInfo(filePath);
                var fileName = Path.GetFileNameWithoutExtension(filePath);

                fileMetadataList.Add(new FileMetadata
                {
                    Key = fileName,
                    FileName = Path.GetFileName(filePath),
                    Size = fileInfo.Length,
                    UploadedAt = fileInfo.CreationTimeUtc,
                    ContentType = GetContentType(fileInfo.Extension)
                });
            }

            var totalCount = fileMetadataList.Count;
            var pagedItems = fileMetadataList
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Task.FromResult(new PaginatedResponse<FileMetadata>
            {
                Items = pagedItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list files");
            return Task.FromResult(new PaginatedResponse<FileMetadata>
            {
                Items = new List<FileMetadata>(),
                TotalCount = 0,
                Page = page,
                PageSize = pageSize,
                TotalPages = 0
            });
        }
    }

    /// <inheritdoc />
    public async Task<string> SaveFileAsync(string fileName, byte[] content, CancellationToken cancellationToken = default)
    {
        try
        {
            var fileKey = Guid.NewGuid().ToString();
            var fileExtension = Path.GetExtension(fileName);
            var storedFileName = $"{fileKey}{fileExtension}";
            var filePath = Path.Combine(_basePath, storedFileName);

            await File.WriteAllBytesAsync(filePath, content, cancellationToken);

            _logger.LogInformation("File saved successfully: {FileName} -> {FileKey}", fileName, fileKey);
            return fileKey;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save file: {FileName}", fileName);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<string> SaveFileAsync(string fileName, Stream content, CancellationToken cancellationToken = default)
    {
        try
        {
            var fileKey = Guid.NewGuid().ToString();
            var fileExtension = Path.GetExtension(fileName);
            var storedFileName = $"{fileKey}{fileExtension}";
            var filePath = Path.Combine(_basePath, storedFileName);

            using var fileStream = new FileStream(filePath, FileMode.Create);
            await content.CopyToAsync(fileStream, cancellationToken);

            _logger.LogInformation("File saved successfully: {FileName} -> {FileKey}", fileName, fileKey);
            return fileKey;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save file: {FileName}", fileName);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<byte[]?> GetFileAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var files = Directory.GetFiles(_basePath, $"{fileKey}.*");
            if (files.Length == 0)
            {
                return null;
            }

            var filePath = files[0];
            var content = await File.ReadAllBytesAsync(filePath, cancellationToken);

            _logger.LogInformation("File retrieved: {FileKey}", fileKey);
            return content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get file: {FileKey}", fileKey);
            return null;
        }
    }

    /// <inheritdoc />
    public Task<Stream?> GetFileStreamAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var files = Directory.GetFiles(_basePath, $"{fileKey}.*");
            if (files.Length == 0)
            {
                return Task.FromResult<Stream?>(null);
            }

            var filePath = files[0];
            var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);

            _logger.LogInformation("File stream retrieved: {FileKey}", fileKey);
            return Task.FromResult<Stream?>(fileStream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get file stream: {FileKey}", fileKey);
            return Task.FromResult<Stream?>(null);
        }
    }

    /// <inheritdoc />
    public Task<string> GetFileUrlAsync(string fileKey, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        // For local file storage, return a simple URL
        // In a real implementation, this might generate a signed URL for cloud storage
        var expirationParam = expiration.HasValue ? $"?expires={DateTimeOffset.UtcNow.Add(expiration.Value).ToUnixTimeSeconds()}" : "";
        return Task.FromResult($"/api/files/{fileKey}{expirationParam}");
    }

    /// <summary>
    /// Gets content type based on file extension
    /// </summary>
    private static string GetContentType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".txt" => "text/plain",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".csv" => "text/csv",
            ".json" => "application/json",
            ".xml" => "application/xml",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }
}
