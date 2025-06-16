# Shared Directory

This directory contains reusable components, hooks, and utilities that are shared across features.

## Structure

```
shared/
├── components/
│   ├── ui/           # Basic UI components (Button, Input, etc.)
│   ├── layout/       # Layout components (Header, Sidebar, etc.)
│   └── common/       # Common business components
├── hooks/            # Reusable custom hooks
├── services/         # Shared API services and utilities
├── types/            # Shared TypeScript types
├── utils/            # Utility functions
├── constants/        # Application constants
└── stores/           # Global application stores
```

## Guidelines

1. Only place truly reusable code here
2. Avoid feature-specific logic
3. Keep components generic and configurable
4. Use composition patterns for flexibility
5. Document public APIs clearly
