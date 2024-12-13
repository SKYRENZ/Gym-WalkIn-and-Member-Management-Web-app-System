// src/hooks/useFetchData.js
import { useState, useEffect } from 'react';
import api from '../api';  // Adjust the import path as needed

export const useFetchData = (endpoint, dependencies = []) => {
  const [data, setData] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(endpoint);
        setData(response.data || []); // Ensure data is an array
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [endpoint, ...dependencies]);

  return { data, isLoading, error };
};

export default useFetchData;