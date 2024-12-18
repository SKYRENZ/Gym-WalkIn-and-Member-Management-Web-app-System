// src/hooks/useCustomerRecords.js
import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export const useCustomerRecords = (year, type) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0);

  // Create a function to fetch data that can be called multiple times
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      if (type === 'Walk In') {
        endpoint = '/getWalkInCustomerRecords';
      } else if (type === 'Member') {
        endpoint = '/getMemberCustomerRecords';
      } else {
        setData([]);
        setLoading(false);
        return;
      }

      console.log(`Fetching ${type} records for year ${year}`);

      const response = await api.get(endpoint, {
        params: { 
          year: year, 
          period: 'monthly'
        }
      });

      console.log('Raw API Response:', response.data);

      // Ensure data is an array and has the correct structure
      const processedData = Array.isArray(response.data.data) 
        ? response.data.data.map(item => ({
            names: item.names || 'Unknown',
            total_entries: item.total_entries || 0,
            last_payment_date: item.last_payment_date || 'N/A'
          }))
        : [];

      console.log('Processed Data:', processedData);

      setData(processedData);
    } catch (err) {
      console.error('Full error details:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        // Handle specific error cases
        if (err.response.status === 500) {
          // If it's a server error, set an empty array
          setData([]);
          setError('No data available for the selected year');
        } else {
          setError(`Server Error: ${err.response.data.error || 'Unknown error'}`);
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server');
      } else {
        console.error('Error setting up request:', err.message);
        setError(err.message);
      }
      
      // Ensure data is set to an empty array on error
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [year, type]);

  // Initial fetch and refetch mechanism
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { 
    data, 
    loading, 
    error,
    refetch  // Directly expose the refetch function
  };
};