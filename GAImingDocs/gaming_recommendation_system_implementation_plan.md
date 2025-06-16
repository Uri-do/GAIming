## 1. Introduction

This document describes a detailed implementation plan for a scalable, real-time gaming recommendation system leveraging the existing ProgressPlay technology stack and data schema. It integrates the architectural standards (.NET 8, Clean Architecture, CQRS) with advanced recommendation algorithms to deliver personalized game suggestions that boost engagement, retention, and revenue.

---

## 2. High-Level Architecture

```mermaid
flowchart TD
  subgraph Data Layer
    A[(SQL Server)]
  end
  subgraph Ingestion & Processing
    B[Kafka Topics]
    C[Spark Streaming]
    D[Feature Store (Feast/Tecton)]
  end
  subgraph Model Training
    E[Batch ETL (Spark)]
    F[Offline Training (TensorFlow/PyTorch)]
    G[Model Registry]
  end
  subgraph Serving & API
    H[Feature Fetch Service (.NET Core)]
    I[Model Inference Service (TensorFlow Serving)]
    J[Recommendation API (ASP.NET Core Web API)]
  end
  subgraph Frontend
    K[React SPA]
  end
  A --> B --> C --> D
  D --> H --> I --> J --> K
  E --> F --> G
```

- **Event Streaming**: Apache Kafka captures game-play events (Games\_PlayedGames)
- **Real-Time Feature Computation**: Spark Streaming processes events, updates Redis-backed feature store
- **Batch Feature Engineering**: Spark jobs compute rolling, RFM, temporal features into feature store
- **Model Training**: Offline jobs register models in MLflow-like registry
- **Serving Layer**: .NET Core microservices fetch features, call TensorFlow Serving for predictions
- **Frontend Integration**: React components consume Recommendation API to display suggestions

---

## 3. Data Ingestion & Storage

1. **Source Tables** (SQL Server):
   - `Games.Games` (game metadata)
   - `Games.Games_PlayedGames` (play history)
   - `common.tbl_Players` (player profiles)
   - `accounts.tbl_Account_transactions` (financial context)
2. **Change Data Capture (CDC)** on `Games_PlayedGames` for real-time ingestion
3. **Kafka Topics**:
   - `played-games` (row-level events)
   - `player-profiles` (profile updates)
4. **Raw Event Store**: HDFS/S3 for raw JSON events

---

## 4. Data Schema Mapping & Feature Store

| Logical Feature    | Source                                | Transformation                        |
| ------------------ | ------------------------------------- | ------------------------------------- |
| Total Bets (30d)   | Games\_PlayedGames.TotalBetReal       | SUM over 30-day window                |
| Win/Loss Ratio     | TotalWinRealMoney / TotalBetRealMoney | Ratio, null-handled                   |
| Session Frequency  | Count(pg.ID) per user per day         | Count in tumbling window              |
| RTP Preference     | Games.PayoutLow/High                  | Continuous value; aggregated per-user |
| Volatility Profile | Games.VolatilityID                    | One-hot or embedding                  |

- Use Feast/Tecton to define feature definitions, materialize online/offline tables

---

## 5. Feature Engineering Pipeline

1. **Batch Spark Jobs** (scheduled daily):
   - Rolling window aggregations (7, 14, 30 days)
   - RFM measures: Recency (days since last play), Frequency (# sessions), Monetary (net win)
   - Graph embeddings: player–game bipartite graph (Node2Vec)
2. **Streaming Spark Jobs**:
   - Update streaming counters in Redis
   - Compute session-based features (last 5 events)
3. **Feature Serving**:
   - Online store: Redis / DynamoDB for low-latency lookups

---

## 6. Recommendation Models & Algorithms

- **Cold Start**:
  - Content-based filtering using game metadata (type, provider, theme)
  - Popularity-based trending games for demographics
- **Collaborative Filtering**:
  - Matrix Factorization (ALS) for dense interactions
  - Neural Collaborative Filtering (MLP layers) for non-linear patterns
- **Contextual Bandits**:
  - LinUCB using user risk profile, time of day, device type
- **Ensemble**:
  - Weighted sum of CF, content, and bandit scores

---

## 7. Model Training & Evaluation

1. **Offline Training**:
   - Environment: Docker containers with TensorFlow & PyTorch
   - Data: Historical features from Hive or Parquet
   - Training: Cross-validation, hyperparameter tuning via Optuna
   - Metrics: Precision\@K, NDCG, CTR uplift, AUC
2. **Model Registry**:
   - Store model artifacts, metadata, schema
   - Promote to staging/production
3. **A/B Testing**:
   - Canary rollout to 5% users
   - Monitor engagement uplift vs control

---

## 8. Serving & Inference

1. **Feature Fetch Service** (.NET Core Web API):
   - Aggregates features from Redis & SQL
   - Returns feature vector JSON
2. **Inference Service**:
   - TensorFlow Serving gRPC endpoint
   - Scales horizontally via Kubernetes HPA
3. **Recommendation API** (/api/recommendations):
   - Input: PlayerID, context (device, sessionId)
   - Output: Top-N game IDs with scores

---

## 9. Integration with Existing Backend

- **CQRS**: Queries handled via MediatR handlers that call Recommendation API
- **Clean Architecture**: Place recommendation client in Infrastructure layer
- **Dependency Injection**: Register `IRecommendationService` in DI container

---

## 10. Frontend Integration

- **React Components**:
  - `useRecommendations(playerId)` hook (TanStack Query)
  - `RecommendationCarousel` UI using MUI `Card`, `Grid`
- **UI/UX**:
  - Display personalized section on lobby page
  - Real-time refresh on session events

---

## 11. DevOps, Monitoring & Logging

- **CI/CD**: GitHub Actions builds images, runs tests, deploys to AKS
- **Monitoring**: Prometheus & Grafana for latency, error rates
- **Logging**: ELK stack for request tracing
- **Alerts**: SLO-based alerts on response time >300ms

---

## 12. Security & Compliance

- **Authentication**: JWT validation in Recommendation API
- **Authorization**: RBAC via Azure AD roles
- **Data Privacy**: GDPR compliance for personal data in features
- **Responsible Gaming**: Integrate risk-level features to avoid high-risk recommendations

---

## 13. Roadmap & Next Steps

1. Pilot development: Core CF + content-based model (4 weeks)
2. Feature store integration & streaming pipeline (6 weeks)
3. Online inference service & API integration (4 weeks)
4. A/B testing & tuning (8 weeks)
5. Bandit algorithms & risk mitigation (6 weeks)

---

*Prepared by the AI Architecture Team — June 2025*

