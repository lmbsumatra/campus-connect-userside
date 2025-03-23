import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "./consonants";

const useFetchAllItemsForSaleData = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${baseApi}/item-for-sale/info`);
        setItems(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, error, loading };
};

export default useFetchAllItemsForSaleData;
