import { useState } from 'react';
import useFetchData from './useFetchData';

export const useCustomerTracking = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { 
    data: customerData, 
    isLoading, 
    error,
    refetch 
  } = useFetchData(
    `http://localhost:3000/customerTracking?date=${date}`, 
    [date]
  );

  // Format the selected date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    customerData,
    isLoading,
    error,
    date,
    setDate,
    formattedDate,
    refetch
  };
};