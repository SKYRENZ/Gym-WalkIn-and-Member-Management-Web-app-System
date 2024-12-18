import { useState, useEffect } from 'react';
import api from '../api';

export const useIncomeSummary = (year, period, date = null) => {
    const [incomeData, setIncomeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIncomeData = async () => {
            try {
                console.log('Fetching Income Data:', { year, period, date });
                setIsLoading(true);
                setError(null);

                let formattedDate = null;
                if (period === 'daily' && date) {
                    formattedDate = date.toLocaleString('en-US', { 
                        timeZone: 'Asia/Manila', 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                    }).split(',')[0].replace(/\//g, '-');
                }

                console.log('Formatted Date for API:', {
                    originalDate: date,
                    formattedDate: formattedDate
                });

                const response = await api.get('/getIncomeSummary', {
                    params: { 
                        year, 
                        period,
                        date: formattedDate
                    }
                });

                // Add more detailed logging
                console.log('Full Income Summary API Response:', response.data);
                console.log('Walk-In Income Data:', response.data.data.walkInIncomeByPeriod);
                console.log('Member Income Data:', response.data.data.memberIncomeByPeriod);

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