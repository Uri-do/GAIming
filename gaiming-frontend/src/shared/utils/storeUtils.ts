/**
 * Advanced Zustand store utilities with discriminated unions
 * Provides type-safe store creation patterns and middleware
 */

import { create, StateCreator } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import type { AsyncState, ResourceState, MutationState } from '../types';
import { asyncState, resourceState, mutationState } from './stateUtils';

// Store slice pattern for composition
export interface StoreSlice<T> {
  (...args: Parameters<StateCreator<T>>): T;
}

// Enhanced store options
export interface StoreOptions {
  name?: string;
  persist?: boolean;
  devtools?: boolean;
  subscriptions?: boolean;
  partialize?: (state: any) => any;
  version?: number;
}

// Create enhanced store with middleware composition
export const createEnhancedStore = <T>(
  storeCreator: StateCreator<T>,
  options: StoreOptions = {}
) => {
  const {
    name = 'store',
    persist: enablePersist = false,
    devtools: enableDevtools = true,
    subscriptions = false,
    partialize,
    version = 1,
  } = options;

  let store = storeCreator;

  // Apply subscriptions middleware
  if (subscriptions) {
    store = subscribeWithSelector(store);
  }

  // Apply devtools middleware
  if (enableDevtools && typeof window !== 'undefined') {
    store = devtools(store, { name });
  }

  // Apply persist middleware
  if (enablePersist) {
    store = persist(store, {
      name: `${name}-storage`,
      version,
      ...(partialize && { partialize }),
    });
  }

  return create(store);
};

// Async operation slice creator
export const createAsyncSlice = <T, P = void>(
  name: string,
  asyncFn: (params: P) => Promise<T>
) => {
  return (set: any, get: any) => ({
    [`${name}State`]: asyncState.idle() as AsyncState<T>,
    
    [`execute${name.charAt(0).toUpperCase() + name.slice(1)}`]: async (params: P) => {
      set((state: any) => {
        state[`${name}State`] = asyncState.loading<T>();
      });

      try {
        const result = await asyncFn(params);
        set((state: any) => {
          state[`${name}State`] = asyncState.success(result);
        });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Operation failed';
        set((state: any) => {
          state[`${name}State`] = asyncState.error<T>(errorMessage);
        });
        throw error;
      }
    },

    [`reset${name.charAt(0).toUpperCase() + name.slice(1)}`]: () => {
      set((state: any) => {
        state[`${name}State`] = asyncState.idle();
      });
    },
  });
};

// Resource management slice creator
export const createResourceSlice = <T, K extends string | number>(
  name: string,
  fetchFn: (id: K) => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
  } = {}
) => {
  const { staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } = options;

  return (set: any, get: any) => ({
    [`${name}Cache`]: new Map<K, ResourceState<T>>(),

    [`get${name.charAt(0).toUpperCase() + name.slice(1)}`]: async (id: K, forceRefresh = false) => {
      const cache = get()[`${name}Cache`];
      const cached = cache.get(id);

      // Check if we have fresh data
      if (!forceRefresh && cached && resourceState.hasData(cached)) {
        const isStale = Date.now() - cached.lastFetch > staleTime;
        if (!isStale) {
          return cached.data;
        }
      }

      // Set loading state
      set((state: any) => {
        const newCache = new Map(state[`${name}Cache`]);
        newCache.set(id, resourceState.loading<T>(cached?.data));
        state[`${name}Cache`] = newCache;
      });

      try {
        const result = await fetchFn(id);
        
        set((state: any) => {
          const newCache = new Map(state[`${name}Cache`]);
          newCache.set(id, resourceState.success(result));
          state[`${name}Cache`] = newCache;
        });

        // Schedule cache cleanup
        setTimeout(() => {
          set((state: any) => {
            const newCache = new Map(state[`${name}Cache`]);
            newCache.delete(id);
            state[`${name}Cache`] = newCache;
          });
        }, cacheTime);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
        
        set((state: any) => {
          const newCache = new Map(state[`${name}Cache`]);
          newCache.set(id, resourceState.error<T>(errorMessage));
          state[`${name}Cache`] = newCache;
        });

        throw error;
      }
    },

    [`get${name.charAt(0).toUpperCase() + name.slice(1)}State`]: (id: K): ResourceState<T> => {
      const cache = get()[`${name}Cache`];
      return cache.get(id) || resourceState.idle();
    },

    [`invalidate${name.charAt(0).toUpperCase() + name.slice(1)}`]: (id?: K) => {
      set((state: any) => {
        if (id) {
          const newCache = new Map(state[`${name}Cache`]);
          newCache.delete(id);
          state[`${name}Cache`] = newCache;
        } else {
          state[`${name}Cache`] = new Map();
        }
      });
    },
  });
};

// Mutation slice creator with optimistic updates
export const createMutationSlice = <T, P = void>(
  name: string,
  mutateFn: (params: P) => Promise<T>,
  options: {
    optimisticUpdate?: (params: P) => T;
    onSuccess?: (result: T, params: P) => void;
    onError?: (error: Error, params: P) => void;
  } = {}
) => {
  const { optimisticUpdate, onSuccess, onError } = options;

  return (set: any, get: any) => ({
    [`${name}State`]: mutationState.idle() as MutationState<T>,

    [`${name}`]: async (params: P) => {
      const optimisticData = optimisticUpdate?.(params);
      
      set((state: any) => {
        state[`${name}State`] = mutationState.pending<T>(optimisticData);
      });

      try {
        const result = await mutateFn(params);
        
        set((state: any) => {
          state[`${name}State`] = mutationState.success(result);
        });

        onSuccess?.(result, params);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Mutation failed';
        const originalData = optimisticData;
        
        set((state: any) => {
          state[`${name}State`] = mutationState.error<T>(errorMessage, originalData);
        });

        onError?.(error as Error, params);
        throw error;
      }
    },

    [`reset${name.charAt(0).toUpperCase() + name.slice(1)}`]: () => {
      set((state: any) => {
        state[`${name}State`] = mutationState.idle();
      });
    },
  });
};

// Pagination slice creator
export const createPaginationSlice = <T>(
  name: string,
  fetchFn: (page: number, pageSize: number, filters?: any) => Promise<{
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }>
) => {
  return (set: any, get: any) => ({
    [`${name}Data`]: {
      items: [] as T[],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
    },
    [`${name}State`]: asyncState.idle() as AsyncState<T[]>,
    [`${name}Filters`]: {} as any,

    [`fetch${name.charAt(0).toUpperCase() + name.slice(1)}`]: async (
      page?: number,
      pageSize?: number,
      filters?: any
    ) => {
      const currentData = get()[`${name}Data`];
      const currentFilters = get()[`${name}Filters`];
      
      const finalPage = page ?? currentData.pageNumber;
      const finalPageSize = pageSize ?? currentData.pageSize;
      const finalFilters = filters ?? currentFilters;

      set((state: any) => {
        state[`${name}State`] = asyncState.loading<T[]>();
        state[`${name}Filters`] = finalFilters;
      });

      try {
        const result = await fetchFn(finalPage, finalPageSize, finalFilters);
        
        set((state: any) => {
          state[`${name}Data`] = result;
          state[`${name}State`] = asyncState.success(result.items);
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Fetch failed';
        
        set((state: any) => {
          state[`${name}State`] = asyncState.error<T[]>(errorMessage);
        });

        throw error;
      }
    },

    [`set${name.charAt(0).toUpperCase() + name.slice(1)}Filters`]: (filters: any) => {
      set((state: any) => {
        state[`${name}Filters`] = filters;
      });
    },

    [`reset${name.charAt(0).toUpperCase() + name.slice(1)}`]: () => {
      set((state: any) => {
        state[`${name}Data`] = {
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 20,
          totalPages: 0,
        };
        state[`${name}State`] = asyncState.idle();
        state[`${name}Filters`] = {};
      });
    },
  });
};

// Store composition utility
export const composeStores = <T extends Record<string, any>>(
  ...slices: Array<(set: any, get: any) => Partial<T>>
) => {
  return (set: any, get: any): T => {
    return slices.reduce((acc, slice) => {
      return { ...acc, ...slice(set, get) };
    }, {} as T);
  };
};
