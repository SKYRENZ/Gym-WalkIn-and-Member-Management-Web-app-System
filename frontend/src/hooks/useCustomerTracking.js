import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useCustomerTracking = (initialDate = null) => {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomerData = useCallback(async (date) => {
    const formattedDate = new Date(date).toISOString().split('T')[0];

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/customerTracking', {
        params: { date: formattedDate }
      });

      if (response.data && response.data.success && response.data.data) {
        setCustomerData(response.data.data);
      } else {
        setCustomerData([]);
      }
    } catch (err) {
      setError('Failed to fetch customer data');
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