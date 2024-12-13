import { useState, useEffect } from 'react';
import api from '../api'; // Adjust the import path as needed

export const useCustomerTracking = () => {
    const [customerData, setCustomerData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
        setDate 
    };
};