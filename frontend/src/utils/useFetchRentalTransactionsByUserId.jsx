import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "./consonants";

const useFetchRentalTransactionsByUserId = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${baseApi}/rental-transaction/user/${userId}`);
        if (response.data && Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          setTransactions([]); 
          setError("No transactions found."); 
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  return { transactions, error, loading };
};

export default useFetchRentalTransactionsByUserId;
