# Phase 1 Testing Guide

## 🎯 Overview

This guide provides comprehensive testing instructions for all Phase 1 implementations:
- Feature-Based Architecture
- TypeScript Strict Mode
- Zustand State Management
- Error Boundaries

## 🏗️ Pre-Testing Setup

### 1. Install Dependencies
```bash
cd gaiming-frontend
npm install
```

### 2. Environment Configuration
Ensure your `.env` file has the required variables:
```env
VITE_API_BASE_URL=http://localhost:65073/api
VITE_APP_NAME=GAIming
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AB_TESTING=true
VITE_ENABLE_REAL_TIME_UPDATES=true
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=info
```

### 3. TypeScript Compilation Check
```bash
npm run type-check
# or
npx tsc --noEmit
```

## 🧪 Testing Scenarios

### 1. Feature-Based Architecture Testing

#### Test Import Paths
```typescript
// Test these imports work correctly
import { useGames, gameSelectors } from '@/features/games'
import { apiService } from '@/shared/services'
import { useAuthStore } from '@/app/store'
import { asyncState } from '@/shared/utils'
```

#### Test Feature Isolation
1. Navigate to games feature
2. Verify games load independently
3. Check that games state doesn't interfere with other features
4. Test feature-specific error handling

### 2. TypeScript Strict Mode Testing

#### Test Discriminated Unions
```typescript
// Create a test component to verify type safety
import { asyncState } from '@/shared/utils'
import type { AsyncState } from '@/shared/types'

const TestComponent = () => {
  const [state, setState] = useState<AsyncState<string>>(asyncState.idle())
  
  // These should provide full type safety and autocomplete
  if (asyncState.isLoading(state)) {
    // TypeScript knows state.progress is available
    console.log(state.progress)
  }
  
  if (asyncState.isSuccess(state)) {
    // TypeScript knows state.data is string
    console.log(state.data.toUpperCase())
  }
  
  if (asyncState.isError(state)) {
    // TypeScript knows state.error is available
    console.log(state.error)
  }
}
```

#### Test Error Type Safety
```typescript
import { createApiError, isValidationError } from '@/shared/types'

// Test error creation and type guards
const error = createApiError.validation('Test error', {
  field: 'email',
  value: 'invalid',
  constraints: ['Must be valid email']
})

if (isValidationError(error)) {
  // TypeScript knows error.details is ValidationErrorDetails
  console.log(error.details.field)
}
```

### 3. Zustand Store Testing

#### Test Auth Store
```typescript
// Test authentication flow
const authStore = useAuthStore()

// Test login
await authStore.login({
  username: 'test@example.com',
  password: 'password123'
})

// Test permission checking
const canManageGames = authStore.hasPermission('games:manage')
const isAdmin = authStore.hasRole('Admin')

// Test session management
const sessionValid = authStore.checkSession()
authStore.updateLastActivity()
```

#### Test Games Store
```typescript
// Test games operations
const gameStore = useGameStore()
const gameOperations = useGameOperations()

// Test loading games
await gameOperations.loadGames()

// Test filtering
gameStore.setFilters({ isActive: true, search: 'poker' })

// Test selection
gameStore.toggleGameSelection(123)
gameStore.selectAllGames([1, 2, 3])

// Test bulk operations
await gameOperations.bulkToggleStatus([1, 2, 3], true)
```

#### Test Notification Store
```typescript
// Test notifications
const notificationStore = useNotificationStore()

// Test different notification types
notificationStore.showSuccess('Success', 'Operation completed')
notificationStore.showError('Error', 'Something went wrong')
notificationStore.showWarning('Warning', 'Please check this')

// Test confirmation modal
notificationStore.showConfirm(
  'Confirm Action',
  'Are you sure?',
  () => console.log('Confirmed'),
  () => console.log('Cancelled')
)
```

### 4. Error Boundary Testing

#### Test Component-Level Errors
```typescript
// Create a component that throws an error
const ErrorTestComponent = () => {
  const [shouldError, setShouldError] = useState(false)
  
  if (shouldError) {
    throw new Error('Test component error')
  }
  
  return (
    <FeatureErrorBoundary featureName="Error Test">
      <button onClick={() => setShouldError(true)}>
        Trigger Error
      </button>
    </FeatureErrorBoundary>
  )
}
```

#### Test Async Errors
```typescript
// Test async error handling
const AsyncErrorTest = () => {
  const { handleAsyncError } = useApiErrorHandler()
  
  const triggerAsyncError = () => {
    handleAsyncError(async () => {
      throw new Error('Async operation failed')
    })
  }
  
  return (
    <AsyncErrorBoundary>
      <button onClick={triggerAsyncError}>
        Trigger Async Error
      </button>
    </AsyncErrorBoundary>
  )
}
```

#### Test Network Errors
```typescript
// Test network error handling
const NetworkErrorTest = () => {
  const gameOperations = useGameOperations()
  
  // Disconnect network and try to load games
  const testNetworkError = async () => {
    try {
      await gameOperations.loadGames()
    } catch (error) {
      // Should be handled by error boundaries
      console.log('Network error caught:', error)
    }
  }
  
  return <button onClick={testNetworkError}>Test Network Error</button>
}
```

## 🔍 Manual Testing Checklist

### ✅ Architecture Testing
- [ ] All imports resolve correctly
- [ ] Features are isolated and independent
- [ ] Shared components work across features
- [ ] Configuration is properly typed and validated

### ✅ TypeScript Testing
- [ ] No TypeScript compilation errors
- [ ] Discriminated unions provide proper type safety
- [ ] Error types are correctly discriminated
- [ ] Autocomplete works for all state types

### ✅ Store Testing
- [ ] Auth store handles login/logout correctly
- [ ] Session management works (auto-refresh, expiration)
- [ ] Permission checking is accurate
- [ ] Games store loads and filters data
- [ ] Bulk operations work correctly
- [ ] Notifications display properly
- [ ] Store persistence works across page refreshes

### ✅ Error Boundary Testing
- [ ] Component errors are caught and displayed
- [ ] Feature errors don't crash the entire app
- [ ] Async errors are handled gracefully
- [ ] Network errors show appropriate messages
- [ ] Recovery strategies work (retry, refresh, etc.)
- [ ] Error context is preserved and logged

## 🚀 Performance Testing

### Bundle Size Analysis
```bash
npm run build
npm run analyze
```

### Runtime Performance
1. Open browser DevTools
2. Go to Performance tab
3. Record while navigating through features
4. Check for:
   - Unnecessary re-renders
   - Memory leaks
   - Long tasks
   - Bundle loading times

### Store Performance
1. Use React DevTools Profiler
2. Test store updates don't cause excessive re-renders
3. Verify atomic selectors work correctly
4. Check for memory leaks in stores

## 🐛 Common Issues and Solutions

### TypeScript Errors
- **Issue**: Import path not found
- **Solution**: Check `tsconfig.json` path mapping

### Store Issues
- **Issue**: Store state not persisting
- **Solution**: Check persist configuration and storage

### Error Boundary Issues
- **Issue**: Errors not being caught
- **Solution**: Ensure error boundaries wrap the correct components

## 📊 Success Criteria

### Phase 1 is successful if:
1. ✅ All TypeScript compilation passes without errors
2. ✅ All features load and function independently
3. ✅ Stores maintain state correctly across navigation
4. ✅ Error boundaries catch and handle all error types
5. ✅ Performance is maintained or improved
6. ✅ No console errors in normal operation
7. ✅ All recovery strategies work as expected

## 🎯 Next Steps After Testing

Once Phase 1 testing is complete and successful:
1. Document any issues found and their resolutions
2. Create performance benchmarks for comparison
3. Prepare for Phase 2: Security & Performance
4. Consider additional features or optimizations based on testing results

## 📝 Testing Report Template

```markdown
# Phase 1 Testing Report

## Test Environment
- Browser: [Chrome/Firefox/Safari]
- Node Version: [version]
- npm Version: [version]

## Test Results
- [ ] Architecture: PASS/FAIL
- [ ] TypeScript: PASS/FAIL  
- [ ] Stores: PASS/FAIL
- [ ] Error Boundaries: PASS/FAIL

## Issues Found
1. [Issue description]
   - Severity: [Low/Medium/High]
   - Resolution: [How it was fixed]

## Performance Metrics
- Bundle Size: [size]
- Load Time: [time]
- Memory Usage: [usage]

## Recommendations
[Any recommendations for improvements]
```
