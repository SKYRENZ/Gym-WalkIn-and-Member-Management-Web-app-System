// frontend/src/hooks/useCustomerRecords.js
import { useState, useEffect } from 'react';
import api from '../api';

export const useCustomerRecords = (year, type) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerRecords = async () => {
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

        const response = await api.get(endpoint, {
          params: { 
            year: year, 
            period: 'monthly'
          }
        });

        console.log('Raw API Response:', response.data);

        const processedData = (response.data.data || []).map(item => {
          // Parse the date string to a more readable format
          const [year, month, day] = item.date ? item.date.split('-') : [];
          const formattedDate = year 
            ? new Date(year, month - 1, day).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) 
            : 'N/A';

          return {
            date: formattedDate,
            total_entries: item.total_entries || item.entries,
            names: item.names || 'N/A',
            total_income: item.total_income
          };
        });

        console.log('Processed Frontend Data:', processedData);

        setData(processedData);
      } catch (err) {
        console.error('Full error details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerRecords();
  }, [year, type]);

  return { data, loading, error };
};