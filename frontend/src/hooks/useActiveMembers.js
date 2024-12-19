import { useState, useEffect } from 'react';
import axios from 'axios';

export const useActiveMembers = (year = null) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActiveMembers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/active-members', {
                    params: { year }
                });
                setMembers(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'An error occurred');
                setLoading(false);
            }
        };

        fetchActiveMembers();
    }, [year]);

    return { members, loading, error };
};