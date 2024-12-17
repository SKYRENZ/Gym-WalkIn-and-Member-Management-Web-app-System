import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useCustomerTracking = (initialDate = null) => {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomerData = useCallback(async (date) => {
    // Create a new date object in local timezone
    const localDate = new Date(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate(), 
      0, 0, 0  // Set to midnight
    );

    // Use toLocaleDateString to get the correct date string
    const formattedDate = localDate.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');

    console.log('Selected Date Object:', localDate);
    console.log('Formatted Date:', formattedDate);

    try {
      setIsLoading(true);
      setError(null);
      
      const { data } = await axios.get('http://localhost:3000/customerTracking', {
        params: { date: formattedDate }
      });

      console.log('Raw response:', data);

      if (data && data.success && data.data) {
        setCustomerData(data.data);
      } else {
        setCustomerData([]);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError(error.response?.data?.error || 'Failed to fetch customer data');
      setCustomerData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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