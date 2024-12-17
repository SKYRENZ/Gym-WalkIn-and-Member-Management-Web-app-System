import { useState, useEffect } from 'react';
import api from '../api';

export const useIncomeSummary = (year, period, date = null) => {
    const [incomeData, setIncomeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIncomeData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await api.get('/getIncomeSummary', {
                    params: { 
                        year, 
                        period,
                        date: period === 'daily' ? (date || new Date().toISOString().split('T')[0]) : null
                    }
                });

                setIncomeData(response.data.data);
            } catch (err) {
                console.error('Error fetching income data:', err);
                setError('Failed to fetch income data');
            } finally {
                setIsLoading(false);
            }
        };

        if (year && period) {
            fetchIncomeData();
        }
    }, [year, period, date]);

    return { incomeData, isLoading, error };
};