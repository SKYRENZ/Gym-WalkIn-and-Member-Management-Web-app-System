import { useState, useEffect } from 'react';
import api from '../api';

export const useCustomerTracking = () => {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/customerTracking?date=${date}`);
      setCustomerData(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching customer tracking data:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [date]);

  return { 
    customerData, 
    isLoading, 
    error, 
    setDate, 
    formattedDate,
    refetch: fetchCustomerData 
  };
};