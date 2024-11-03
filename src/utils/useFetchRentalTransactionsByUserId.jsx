import { useEffect, useState } from "react";
import axios from "axios";

const useFetchRentalTransactionsByUserId = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return; // If no userId is provided, don't fetch

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/rental-transaction/user/${userId}`);
        setTransactions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]); // Fetch when userId changes

  return { transactions, error, loading };
};

export default useFetchRentalTransactionsByUserId;
