// src/hooks/useCustomerTracking.js
import { useState, useEffect, useMemo } from 'react';
import api from '../api';

// Export as a named export and default export
export const useCustomerTracking = () => {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/customerTracking?date=${date}`);
        
        // Ensure we always set an array
        const data = response.data.data || [];
        setCustomerData(data);
      } catch (err) {
        setError(err.message);
        setCustomerData([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [date]);

  // Memoize the formatted date to prevent unnecessary recalculations
  const formattedDate = useMemo(() => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [date]);

  // Memoize the refetch function to maintain referential equality
  const refetch = useMemo(() => {
    return async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/customerTracking?date=${date}`);
        
        // Ensure we always set an array
        const data = response.data.data || [];
        setCustomerData(data);
      } catch (err) {
        setError(err.message);
        setCustomerData([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };
  }, [date]);

  return { 
    customerData, 
    isLoading, 
    error, 
    setDate, 
    formattedDate,
    refetch 
  };
};

// Also export as default
export default useCustomerTracking;