import { useEffect, useState } from "react";
import axios from "axios";

const useFetchRentalTransactionsByUserId = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false); // If no userId is provided, set loading to false
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/rental-transaction/user/${userId}`);
        if (response.data && Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          setTransactions([]); // Set to an empty array if no valid data
          setError("No transactions found."); // Set an error message
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