import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useCustomerTracking = (initialDate = null) => {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomerData = useCallback(async (date) => {
    // Ensure date is in correct format
    const formattedDate = new Date(date).toISOString().split('T')[0];

    try {
      setIsLoading(true);
      setError(null);
  
      console.log('Fetching customer data for date:', formattedDate);
  
      const response = await axios.get('http://localhost:3000/customerTracking', {
        params: { date: formattedDate }
      });
  
      console.log('Full API Response:', response);
  
      if (response.data && response.data.success && response.data.data) {
        console.log('Setting customer data:', response.data.data);
        setCustomerData(response.data.data);
      } else {
        console.warn('No data in response:', response.data);
        setCustomerData([]);
      }
    } catch (err) {
      console.error('Fetch Error Details:', err);
      
      // Detailed error handling
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Error Response:', err.response.data);
          setError(err.response.data.details || 'Failed to fetch customer data');
        } else if (err.request) {
          console.error('No Response Received:', err.request);
          setError('No response from server. Check network connection.');
        } else {
          console.error('Request Setup Error:', err.message);
          setError('Error in request setup: ' + err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
      
      setCustomerData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on initial load or when date changes
  useEffect(() => {
    if (initialDate) {
      fetchCustomerData(initialDate);
    }
  }, [initialDate, fetchCustomerData]);

  return {
    customerData,
    isLoading,
    error,
    fetchCustomerData
  };
};