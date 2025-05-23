import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "./consonants";

const useFetchAllListingsData = () => {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${baseApi}/listings/info`);
        setListings(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return { listings, error, loading };
};

export default useFetchAllListingsData;
