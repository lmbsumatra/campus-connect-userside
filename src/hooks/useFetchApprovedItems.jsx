import { useState, useEffect } from 'react';
import axios from 'axios';

// Custom hook to fetch listings
const useFetchApprovedItems = (url) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(url);
        console.log('Listings Response data:', response.data);
        setItems(response.data); // Set listings data
      } catch (err) {
        setError(err.message); // Handle error
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchItems();
  }, [url]);

  return { items, loading, error };
};

export default useFetchApprovedItems;
