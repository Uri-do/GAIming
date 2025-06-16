# GAIming - Gaming Recommendation System

GAIming is an AI-powered gaming recommendation system built with Clean Architecture, CQRS, React frontend, and advanced machine learning algorithms to deliver personalized game suggestions that boost engagement, retention, and revenue.

## 🏗️ Architecture Overview

GAIming follows Clean Architecture principles with gaming-specific components:

- **Core Layer**: Gaming domain entities (Games, Players, PlayedGames), recommendation interfaces, and business logic
- **Infrastructure Layer**: Database access, ML model serving, feature store integration, and external services
- **API Layer**: Recommendation controllers, CQRS handlers for gaming operations, and web concerns
- **Frontend Layer**: React + TypeScript gaming UI with recommendation carousels and player dashboards
- **Worker Layer**: Background ML training, feature engineering, and batch recommendation generation

## 🚀 Gaming Recommendation Features

### Backend (.NET 8)
- ✅ Clean Architecture with Gaming Domain Design
- ✅ CQRS with MediatR for gaming operations
- ✅ Result<T> pattern for error handling
- ✅ Entity Framework Core with Gaming Database Schema
- ✅ JWT Authentication & Player Authorization
- ✅ Role-based access control for players and admins
- ✅ Gaming-specific security middleware
- ✅ Recommendation API versioning and documentation
- ✅ Structured logging with Serilog for gaming events
- ✅ Health checks and ML model monitoring
- ✅ Background ML training and feature engineering services
- ✅ Comprehensive gaming recommendation testing

### Frontend (React 18 + TypeScript)
- ✅ Modern React with TypeScript for gaming UI
- ✅ Material-UI gaming component library
- ✅ TanStack Query for recommendation data fetching
- ✅ React Router for gaming navigation
- ✅ Player authentication context and guards
- ✅ Responsive gaming design system
- ✅ Real-time recommendation updates with SignalR
- ✅ Gaming internationalization (i18n)
- ✅ Gaming component testing with Vitest and Testing Library

### Infrastructure & DevOps
- ✅ Docker containerization
- ✅ Docker Compose for development
- ✅ SQL Server database setup
- ✅ Redis caching
- ✅ Prometheus metrics
- ✅ Grafana dashboards
- ✅ ELK stack for logging
- ✅ Kubernetes deployment manifests

## 📦 Installation

```bash
# Install the template
dotnet new install EnterpriseApp.Templates

# Create a new application
dotnet new enterprise-app --name "MyCompany.CRM" --domain "Customer" --output "./MyApp"

# Navigate to the created application
cd MyApp

# Run the setup script
./setup.ps1
```

## 🛠️ Template Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `--name` | Application name and namespace | `MyApp` | `Contoso.CRM` |
| `--domain` | Primary domain entity | `Item` | `Customer`, `Product`, `Order` |
| `--database` | Database name | `{name}DB` | `ContosoCRM` |
| `--port` | API port | `5000` | `8080` |
| `--frontend-port` | Frontend port | `3000` | `3001` |
| `--enable-auth` | Include authentication | `true` | `false` |
| `--enable-worker` | Include worker service | `true` | `false` |
| `--enable-docker` | Include Docker setup | `true` | `false` |

## 📁 Generated Project Structure

```
MyApp/
├── src/
│   ├── MyApp.Core/              # Domain layer
│   ├── MyApp.Infrastructure/    # Infrastructure layer
│   ├── MyApp.Api/              # API layer
│   ├── MyApp.Worker/           # Background services
│   └── MyApp.Frontend/         # React frontend
├── tests/
│   ├── MyApp.Core.Tests/       # Unit tests
│   ├── MyApp.Api.Tests/        # Integration tests
│   └── MyApp.Frontend.Tests/   # Frontend tests
├── docs/                       # Documentation
├── scripts/                    # Setup and deployment scripts
├── docker/                     # Docker configuration
├── k8s/                        # Kubernetes manifests
├── Database/                   # Database scripts
├── docker-compose.yml          # Development environment
├── MyApp.sln                   # Solution file
└── README.md                   # Project documentation
```

## 🎯 Quick Start Examples

### Basic CRM Application
```bash
dotnet new enterprise-app \
  --name "Contoso.CRM" \
  --domain "Customer" \
  --database "ContosoCRM" \
  --output "./ContosoCRM"
```

### E-commerce Platform
```bash
dotnet new enterprise-app \
  --name "ShopApp.Platform" \
  --domain "Product" \
  --database "ShopAppDB" \
  --port 8080 \
  --output "./ShopApp"
```

### Project Management System
```bash
dotnet new enterprise-app \
  --name "ProjectHub.Core" \
  --domain "Project" \
  --database "ProjectHubDB" \
  --enable-worker true \
  --output "./ProjectHub"
```

## 🔧 Customization

After generation, you can customize:

1. **Domain Entities**: Modify entities in `{Name}.Core/Entities/`
2. **Business Logic**: Add domain services in `{Name}.Core/Services/`
3. **API Endpoints**: Create CQRS handlers in `{Name}.Api/CQRS/`
4. **Frontend Components**: Add React components in `{Name}.Frontend/src/components/`
5. **Database Schema**: Update Entity Framework configurations

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Development Setup](./docs/DEVELOPMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guide](./docs/SECURITY.md)
- [Testing Guide](./docs/TESTING.md)
- [API Documentation](./docs/API.md)

## 🤝 Contributing

This template is based on the proven MonitoringGrid architecture. Contributions are welcome!

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
