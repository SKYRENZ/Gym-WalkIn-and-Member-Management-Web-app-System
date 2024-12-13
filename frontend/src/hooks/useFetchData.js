import { useState, useEffect } from 'react';
import api from '../api';  // Adjust the import path as needed

export const useFetchData = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching endpoint:', endpoint);  // Debug logging
        
        const response = await api.get(endpoint);
        
        // Log the entire response for debugging
        console.log('Full API Response:', response);
        
        setData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err);
        console.error('Error Details:', 
          err.response ? err.response.data : 'No response data',
          err.message
        );
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint, ...dependencies]);

  return { data, isLoading, error };
};

export default useFetchData;