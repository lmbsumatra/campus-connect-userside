import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "../App";

const useFetchAllRentalTransactionsData = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${baseApi}/rental-transaction/all`);
        console.log("Fetched Transactions:", response.data);
        setTransactions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return { transactions, error, loading };
};

export default useFetchAllRentalTransactionsData;
