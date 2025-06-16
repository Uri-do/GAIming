/**
 * Utility functions for working with discriminated union state types
 * Provides type-safe state management helpers
 */

import type { AsyncState, ResourceState, MutationState, FormState, NetworkState } from '../types';

// AsyncState utilities
export const asyncState = {
  idle: (): AsyncState<never> => ({ status: 'idle' }),
  
  loading: <T>(progress?: number): AsyncState<T> => ({ 
    status: 'loading', 
    ...(progress !== undefined && { progress }) 
  }),
  
  success: <T>(data: T): AsyncState<T> => ({ 
    status: 'success', 
    data, 
    timestamp: Date.now() 
  }),
  
  error: <T, E = string>(error: E, retryCount?: number): AsyncState<T, E> => ({ 
    status: 'error', 
    error, 
    timestamp: Date.now(),
    ...(retryCount !== undefined && { retryCount })
  }),

  // Type guards
  isIdle: <T, E>(state: AsyncState<T, E>): state is { status: 'idle' } => 
    state.status === 'idle',
  
  isLoading: <T, E>(state: AsyncState<T, E>): state is { status: 'loading'; progress?: number } => 
    state.status === 'loading',
  
  isSuccess: <T, E>(state: AsyncState<T, E>): state is { status: 'success'; data: T; timestamp: number } => 
    state.status === 'success',
  
  isError: <T, E>(state: AsyncState<T, E>): state is { status: 'error'; error: E; timestamp: number; retryCount?: number } => 
    state.status === 'error',

  // Data extraction with defaults
  getData: <T, E>(state: AsyncState<T, E>, defaultValue: T): T => 
    asyncState.isSuccess(state) ? state.data : defaultValue,
  
  getError: <T, E>(state: AsyncState<T, E>): E | null => 
    asyncState.isError(state) ? state.error : null,
};

// ResourceState utilities
export const resourceState = {
  idle: (): ResourceState<never> => ({ status: 'idle' }),
  
  loading: <T>(optimisticData?: T): ResourceState<T> => ({ 
    status: 'loading', 
    ...(optimisticData && { optimisticData }) 
  }),
  
  success: <T>(data: T, stale = false): ResourceState<T> => ({ 
    status: 'success', 
    data, 
    lastFetch: Date.now(),
    stale 
  }),
  
  error: <T, E = string>(error: E, canRetry = true): ResourceState<T, E> => ({ 
    status: 'error', 
    error, 
    lastAttempt: Date.now(),
    canRetry 
  }),

  // Type guards
  isStale: <T, E>(state: ResourceState<T, E>): boolean => 
    state.status === 'success' && state.stale,
  
  canRetry: <T, E>(state: ResourceState<T, E>): boolean => 
    state.status === 'error' && state.canRetry,
  
  hasData: <T, E>(state: ResourceState<T, E>): state is { status: 'success'; data: T; lastFetch: number; stale: boolean } => 
    state.status === 'success',
};

// MutationState utilities
export const mutationState = {
  idle: (): MutationState<never> => ({ status: 'idle' }),
  
  pending: <T>(optimisticData?: T): MutationState<T> => ({ 
    status: 'pending', 
    ...(optimisticData && { optimisticData }) 
  }),
  
  success: <T>(data: T): MutationState<T> => ({ 
    status: 'success', 
    data, 
    timestamp: Date.now() 
  }),
  
  error: <T, E = string>(error: E, originalData?: T): MutationState<T, E> => ({ 
    status: 'error', 
    error, 
    ...(originalData && { originalData }) 
  }),

  // Type guards
  isPending: <T, E>(state: MutationState<T, E>): state is { status: 'pending'; optimisticData?: T } => 
    state.status === 'pending',
  
  hasOptimisticData: <T, E>(state: MutationState<T, E>): boolean => 
    state.status === 'pending' && 'optimisticData' in state,
};

// FormState utilities
export const formState = {
  pristine: <T>(initialData: T): FormState<T> => ({ 
    status: 'pristine', 
    initialData 
  }),
  
  editing: <T>(data: T, isDirty: boolean): FormState<T> => ({ 
    status: 'editing', 
    data, 
    isDirty 
  }),
  
  validating: <T, V = Record<string, string>>(data: T, validationErrors?: V): FormState<T, V> => ({ 
    status: 'validating', 
    data, 
    ...(validationErrors && { validationErrors }) 
  }),
  
  valid: <T>(data: T): FormState<T> => ({ 
    status: 'valid', 
    data, 
    validationErrors: null 
  }),
  
  invalid: <T, V = Record<string, string>>(data: T, validationErrors: V): FormState<T, V> => ({ 
    status: 'invalid', 
    data, 
    validationErrors 
  }),
  
  submitting: <T>(data: T): FormState<T> => ({ 
    status: 'submitting', 
    data 
  }),
  
  submitted: <T>(data: T, result: 'success' | 'error'): FormState<T> => ({ 
    status: 'submitted', 
    data, 
    result 
  }),

  // Type guards
  isDirty: <T, V>(state: FormState<T, V>): boolean => 
    state.status === 'editing' && state.isDirty,
  
  hasErrors: <T, V>(state: FormState<T, V>): boolean => 
    (state.status === 'validating' || state.status === 'invalid') && 
    !!state.validationErrors,
  
  canSubmit: <T, V>(state: FormState<T, V>): boolean => 
    state.status === 'valid' || (state.status === 'editing' && !formState.hasErrors(state)),
};

// NetworkState utilities
export const networkState = {
  offline: (): NetworkState<never> => ({ status: 'offline' }),
  
  connecting: <T>(attempt: number): NetworkState<T> => ({ 
    status: 'connecting', 
    attempt 
  }),
  
  connected: <T>(data: T, latency?: number): NetworkState<T> => ({ 
    status: 'connected', 
    data, 
    ...(latency !== undefined && { latency }) 
  }),
  
  failed: <T, E = string>(error: E, nextRetry: number): NetworkState<T, E> => ({ 
    status: 'failed', 
    error, 
    nextRetry 
  }),

  // Type guards
  isOnline: <T, E>(state: NetworkState<T, E>): boolean => 
    state.status === 'connected',
  
  canRetry: <T, E>(state: NetworkState<T, E>): boolean => 
    state.status === 'failed' && state.nextRetry <= Date.now(),
};

// Generic state transformation utilities
export const stateTransform = {
  // Map data while preserving state structure
  mapData: <T, U, E>(
    state: AsyncState<T, E>, 
    mapper: (data: T) => U
  ): AsyncState<U, E> => {
    if (asyncState.isSuccess(state)) {
      return asyncState.success(mapper(state.data));
    }
    return state as AsyncState<U, E>;
  },

  // Combine multiple async states
  combine: <T1, T2, E>(
    state1: AsyncState<T1, E>,
    state2: AsyncState<T2, E>
  ): AsyncState<[T1, T2], E> => {
    if (asyncState.isError(state1)) return state1 as AsyncState<[T1, T2], E>;
    if (asyncState.isError(state2)) return state2 as AsyncState<[T1, T2], E>;
    if (asyncState.isLoading(state1) || asyncState.isLoading(state2)) {
      return asyncState.loading<[T1, T2]>();
    }
    if (asyncState.isSuccess(state1) && asyncState.isSuccess(state2)) {
      return asyncState.success<[T1, T2]>([state1.data, state2.data]);
    }
    return asyncState.idle();
  },
};

// React hook helpers for discriminated unions
export const stateHooks = {
  // Extract loading state for UI
  useLoadingState: <T, E>(state: AsyncState<T, E>) => ({
    isLoading: asyncState.isLoading(state),
    isError: asyncState.isError(state),
    isSuccess: asyncState.isSuccess(state),
    error: asyncState.getError(state),
    progress: asyncState.isLoading(state) ? state.progress : undefined,
  }),

  // Extract form state for UI
  useFormState: <T, V>(state: FormState<T, V>) => ({
    canSubmit: formState.canSubmit(state),
    isDirty: formState.isDirty(state),
    hasErrors: formState.hasErrors(state),
    isSubmitting: state.status === 'submitting',
    validationErrors: formState.hasErrors(state) ? state.validationErrors : null,
  }),
};
