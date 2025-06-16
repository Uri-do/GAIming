# GAIming - AI-Powered Gaming Recommendation System

## 🚀 Quick Start Guide

Welcome to GAIming! This guide will help you get the system up and running quickly.

## 📋 Prerequisites

### Required Software
- **.NET 8.0 SDK** or later
- **SQL Server** (LocalDB, Express, or Full)
- **Node.js 18+** and **npm** (for frontend)
- **Visual Studio 2022** or **VS Code** (recommended)

### Optional Tools
- **Docker Desktop** (for containerized deployment)
- **Azure Data Studio** or **SQL Server Management Studio**
- **Postman** (for API testing)

## 🏗️ Project Structure

```
GAIming/
├── src/
│   ├── GAIming.Core/           # Domain models, interfaces, business logic
│   ├── GAIming.Infrastructure/ # Data access, external services
│   ├── GAIming.Api/           # REST API controllers
│   ├── GAIming.Worker/        # Background services
│   └── GAIming.Frontend/      # Legacy frontend (optional)
├── gaiming-frontend/          # Modern React frontend
├── docs/                      # Documentation
└── tests/                     # Test projects
```

## 🔧 Backend Setup

### 1. Database Configuration

1. **Update Connection Strings** in `src/GAIming.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "ProgressPlayDBTest": "Server=(localdb)\\mssqllocaldb;Database=ProgressPlayDBTest;Trusted_Connection=true;",
       "GAImingDB": "Server=(localdb)\\mssqllocaldb;Database=GAImingDB;Trusted_Connection=true;"
     }
   }
   ```

2. **Create Databases**:
   ```bash
   # Navigate to API project
   cd src/GAIming.Api
   
   # Create and apply migrations
   dotnet ef database update --context ProgressPlayContext
   dotnet ef database update --context GAImingContext
   ```

### 2. Build and Run Backend

```bash
# Restore packages
dotnet restore

# Build solution
dotnet build

# Run API (from GAIming.Api directory)
cd src/GAIming.Api
dotnet run

# Run Worker Service (optional, in separate terminal)
cd src/GAIming.Worker
dotnet run
```

The API will be available at: `https://localhost:5001` or `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
# Navigate to frontend directory
cd gaiming-frontend

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your API URL
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Frontend

```bash
# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## 🔐 Authentication

### Demo Credentials
- **Email**: admin@gaiming.com
- **Password**: password123

### API Authentication
The system uses JWT tokens. Include the token in API requests:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Key Features

### 1. Dashboard
- Real-time recommendation metrics
- Algorithm performance overview
- System health monitoring

### 2. Game Management
- Game catalog with filtering and search
- Performance analytics per game
- Recommendation effectiveness tracking

### 3. Player Analytics
- Player behavior analysis
- Segmentation and profiling
- Recommendation history

### 4. Recommendation Engine
- Multiple ML algorithms (Collaborative Filtering, Content-Based, Hybrid)
- Real-time and batch recommendation generation
- A/B testing capabilities

### 5. Analytics & Reporting
- Comprehensive performance metrics
- Algorithm comparison
- Export capabilities

## 🧪 Testing the System

### 1. API Testing

Use the Swagger UI at `https://localhost:5001/swagger` to test API endpoints.

Key endpoints to try:
- `GET /api/v1/recommendation/player/{playerId}` - Get recommendations
- `GET /api/v1/games` - List games
- `GET /api/v1/analytics/comprehensive` - Get analytics

### 2. Frontend Testing

1. **Login** with demo credentials
2. **Explore Dashboard** - View metrics and system status
3. **Browse Games** - Check game catalog
4. **View Analytics** - Examine recommendation performance

## 🔧 Configuration

### API Configuration (`appsettings.json`)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "ProgressPlayDBTest": "your-connection-string",
    "GAImingDB": "your-connection-string"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key",
    "Issuer": "GAIming",
    "Audience": "GAIming-Users",
    "ExpirationMinutes": 60
  },
  "RecommendationSettings": {
    "DefaultAlgorithm": "hybrid",
    "MaxRecommendations": 50,
    "CacheExpirationMinutes": 30
  }
}
```

### Frontend Configuration (`.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_NODE_ENV=development
VITE_APP_NAME=GAIming
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AB_TESTING=true
```

## 🚀 Deployment

### Development
- Backend: `dotnet run` in each project
- Frontend: `npm run dev`

### Production
- Backend: `dotnet publish` and deploy to IIS/Azure
- Frontend: `npm run build` and deploy to static hosting

### Docker (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📝 Sample Data

The system includes sample data for:
- **Games**: 100+ sample games with various providers and types
- **Players**: Sample player profiles with different characteristics
- **Recommendations**: Pre-generated recommendations for testing

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify SQL Server is running
   - Check connection strings
   - Ensure databases exist

2. **CORS Errors**
   - Check API CORS configuration
   - Verify frontend URL in allowed origins

3. **Authentication Issues**
   - Check JWT configuration
   - Verify token expiration
   - Clear browser storage

4. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Logs
- **API Logs**: Check console output or configure file logging
- **Frontend Logs**: Check browser developer console

## 📚 Next Steps

1. **Explore the Code**: Review the architecture and implementation
2. **Add Sample Data**: Use the seeding functionality to add more test data
3. **Customize Algorithms**: Implement custom recommendation algorithms
4. **Extend Analytics**: Add custom metrics and reports
5. **Deploy**: Set up production deployment

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed documentation
- **Issues**: Report issues on the project repository
- **API Reference**: Use Swagger UI for API documentation

## 🎯 Key URLs

- **API**: `https://localhost:5001`
- **Frontend**: `http://localhost:3000`
- **Swagger UI**: `https://localhost:5001/swagger`
- **Health Check**: `https://localhost:5001/health`

---

**Happy coding with GAIming!** 🎮🤖
