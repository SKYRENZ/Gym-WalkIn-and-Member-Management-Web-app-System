import { useState, useEffect } from 'react';

const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('http://localhost:3000/members'); // Update the URL to point to the backend
        console.log('Response:', response);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Response Text:', text);
        const data = JSON.parse(text);
        console.log('Data:', data);
        setMembers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        setError(`Error fetching members: ${error.message}`);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return { members, loading, error };
};

export default useMembers;