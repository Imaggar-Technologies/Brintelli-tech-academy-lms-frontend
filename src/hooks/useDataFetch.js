import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Reusable hook for data fetching with retry logic, error handling, and caching
 * 
 * @param {Function} fetchFunction - Async function that returns the data
 * @param {Object} options - Configuration options
 * @param {Array} options.dependencies - Dependencies array for useEffect
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @param {boolean} options.autoFetch - Whether to fetch automatically on mount (default: true)
 * @param {boolean} options.showErrorToast - Whether to show error toast (default: true)
 * @param {string} options.errorMessage - Custom error message
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on error
 * @param {number} options.cacheTime - Cache time in ms (default: 0, no cache)
 * @param {Function} options.transformData - Transform function for the data
 * 
 * @returns {Object} { data, loading, error, refetch, retryCount }
 */
export const useDataFetch = (fetchFunction, options = {}) => {
  const {
    dependencies = [],
    maxRetries = 3,
    retryDelay = 1000,
    autoFetch = true,
    showErrorToast = true,
    errorMessage = 'Failed to load data',
    onSuccess,
    onError,
    cacheTime = 0,
    transformData,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const cacheRef = useRef({ data: null, timestamp: null });
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchWithRetry = useCallback(async (attempt = 0, isRetry = false) => {
    // Check cache first
    if (cacheTime > 0 && cacheRef.current.data && cacheRef.current.timestamp) {
      const cacheAge = Date.now() - cacheRef.current.timestamp;
      if (cacheAge < cacheTime) {
        if (isMountedRef.current) {
          setData(cacheRef.current.data);
          setLoading(false);
          setError(null);
        }
        return;
      }
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      if (!isRetry && isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const result = await fetchFunction(abortControllerRef.current.signal);
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      // Transform data if transform function provided
      const processedData = transformData ? transformData(result) : result;

      // Update cache
      if (cacheTime > 0) {
        cacheRef.current = {
          data: processedData,
          timestamp: Date.now(),
        };
      }

      if (isMountedRef.current) {
        setData(processedData);
        setLoading(false);
        setError(null);
        setRetryCount(0);

        if (onSuccess) {
          onSuccess(processedData);
        }
      }
    } catch (err) {
      // Don't handle aborted requests
      if (err.name === 'AbortError' || abortControllerRef.current.signal.aborted) {
        return;
      }

      // If we have retries left, retry
      if (attempt < maxRetries) {
        const nextAttempt = attempt + 1;
        setRetryCount(nextAttempt);
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchWithRetry(nextAttempt, true);
          }
        }, delay);
      } else {
        // Max retries reached
        if (isMountedRef.current) {
          setError(err);
          setLoading(false);
          
          if (showErrorToast) {
            toast.error(errorMessage || err.message || 'Failed to load data');
          }

          if (onError) {
            onError(err);
          }
        }
      }
    }
  }, [fetchFunction, maxRetries, retryDelay, showErrorToast, errorMessage, onSuccess, onError, transformData, cacheTime]);

  const refetch = useCallback(() => {
    // Clear cache
    cacheRef.current = { data: null, timestamp: null };
    setRetryCount(0);
    fetchWithRetry(0, false);
  }, [fetchWithRetry]);

  useEffect(() => {
    if (autoFetch) {
      fetchWithRetry(0, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    retryCount,
  };
};

/**
 * Specialized hook for fetching leads with proper error handling
 */
export const useLeadsFetch = (filters = {}, options = {}) => {
  const fetchLeads = useCallback(async (signal) => {
    // Dynamic import to avoid circular dependencies
    const { leadAPI } = await import('../api/lead');
    const response = await leadAPI.getAllLeads(filters);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch leads');
    }
    
    return response.data?.leads || [];
  }, [filters]);

  return useDataFetch(fetchLeads, {
    errorMessage: 'Failed to load leads. Please try again.',
    maxRetries: 3,
    retryDelay: 1000,
    cacheTime: 30000, // Cache for 30 seconds
    ...options,
  });
};

export default useDataFetch;

