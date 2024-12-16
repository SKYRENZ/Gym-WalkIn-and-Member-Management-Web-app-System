// src/hooks/useIncomeSummary.js
import { useState, useEffect } from 'react';
import api from '../api';

export const useIncomeSummary = (year, period) => {
  const [walkInData, setWalkInData] = useState([]);
  const [membershipData, setMembershipData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate year input
        const currentYear = new Date().getFullYear();
        const validatedYear = year > currentYear ? currentYear : year;

        // Fetch walk-in data
        let walkInResponse;
        if (period === 'daily') {
          // Use a different approach for daily data
          walkInResponse = await api.get('/getDailyCustomerRecords', {
            params: { 
              year: validatedYear, 
              type: 'Walk In' 
            }
          });
        } else {
          // Use existing monthly endpoint
          walkInResponse = await api.get('/getWalkInCustomerRecords', {
            params: { 
              year: validatedYear, 
              period: period 
            }
          });
        }

        // Fetch membership data
        let membershipResponse;
        if (period === 'daily') {
          membershipResponse = await api.get('/getDailyCustomerRecords', {
            params: { 
              year: validatedYear, 
              type: 'Member' 
            }
          });
        } else {
          membershipResponse = await api.get('/getMemberCustomerRecords', {
            params: { 
              year: validatedYear, 
              period: period 
            }
          });
        }

        // Process walk-in data
        const processedWalkInData = (walkInResponse.data?.data || walkInResponse.data || []).map(item => ({
          ...(period === 'daily' 
            ? { 
                date: item.date, 
                total_income: parseFloat(item.total_income) || 0 
              }
            : { 
                month: item.month, 
                total_income: parseFloat(item.total_income) || 0 
              }
          )
        }));

        // Process membership data
        const processedMembershipData = (membershipResponse.data?.data || membershipResponse.data || []).map(item => ({
          ...(period === 'daily' 
            ? { 
                date: item.date, 
                total_income: parseFloat(item.total_income) || 0 
              }
            : { 
                month: item.month, 
                total_income: parseFloat(item.total_income) || 0 
              }
          )
        }));

        setWalkInData(processedWalkInData);
        setMembershipData(processedMembershipData);
      } catch (err) {
        console.error('Error fetching income data:', err);
        
        // More detailed error logging
        if (err.response) {
          // The request was made and the server responded with a status code
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          console.error('Error response headers:', err.response.headers);
          
          setError(`Server Error: ${err.response.status} - ${err.response.data.message || 'Failed to fetch income data'}`);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          setError('No response from server. Please check your network connection.');
        } else {
          // Something happened in setting up the request
          console.error('Error setting up request:', err.message);
          setError(`Request Error: ${err.message}`);
        }
        
        setWalkInData([]);
        setMembershipData([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if year is valid
    if (year) {
      fetchIncomeData();
    }
  }, [year, period]);

  return { 
    walkInData, 
    membershipData, 
    isLoading, 
    error 
  };
};

export default useIncomeSummary;