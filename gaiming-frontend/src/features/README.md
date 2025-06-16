# Features Directory

This directory contains feature-based modules following the enhanced architecture pattern.

## Structure

Each feature follows this structure:
```
feature-name/
├── components/     # Feature-specific components
├── hooks/         # Feature-specific custom hooks
├── services/      # Feature-specific API services
├── types/         # Feature-specific TypeScript types
├── stores/        # Feature-specific Zustand stores (if needed)
└── index.ts       # Barrel export for the feature
```

## Features

- **analytics/** - Analytics dashboard and reporting
- **games/** - Game management and catalog
- **players/** - Player management and profiles
- **recommendations/** - ML recommendation system
- **admin/** - Administrative functions
- **auth/** - Authentication and authorization
- **ab-testing/** - A/B testing management
- **models/** - ML model management

## Guidelines

1. Keep features isolated with clear boundaries
2. Use selective barrel exports (avoid deep barrel files)
3. Share common functionality through the `shared/` directory
4. Feature-specific stores should be co-located with the feature
5. Cross-feature communication should go through the app-level store or context
