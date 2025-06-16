# App Directory

This directory contains application-level configuration, providers, and global state management.

## Structure

```
app/
├── providers/        # React context providers
├── store/           # Global Zustand stores
├── router/          # Routing configuration
├── config/          # Application configuration
└── types/           # Global type definitions
```

## Guidelines

1. Keep application-level concerns here
2. Global state should be minimal
3. Providers should be composable
4. Configuration should be environment-aware
5. Types should be truly global (used across multiple features)
