import { useState, useEffect } from 'react';
import axios from 'axios';
import { baseApi } from './consonants';

const useFetchRecentActivities = () => {
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await axios.get(`${baseApi}/api/recent-activities`);
                setActivities(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    return { activities, error, loading };
};

export default useFetchRecentActivities;
