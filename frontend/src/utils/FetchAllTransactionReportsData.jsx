import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "./consonants";
import { useAuth } from "../context/AuthContext";

const useFetchAllTransactionReportsData = () => {
  // Renaming state variable for clarity, matches return value
  const [transactionReports, setTransactionReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adminUser } = useAuth();

  const fetchData = async () => {
    if (!adminUser?.token) {
      setError("Admin authentication token not found.");
      setLoading(false);
      setTransactionReports([]); // Ensure it's array even if no token
      return;
    }
    setLoading(true);
    setError(null); // Clear previous errors before fetch
    try {
      const response = await axios.get(`${baseApi}/api/transaction-reports`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      // Ensure API response is actually an array before setting
      if (Array.isArray(response.data)) {
        setTransactionReports(response.data);
      } else {
        console.error("API did not return an array:", response.data);
        setError("Received invalid data format from server.");
        setTransactionReports([]); // Set empty array on invalid data
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error("Failed to fetch transaction reports:", err);
      setTransactionReports([]); // <-- Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminUser?.token]); // Re-fetch if token changes

  const refreshData = () => {
    fetchData();
  };

  const removeReportFromList = (reportId) => {
    setTransactionReports((prev) =>
      prev.filter((report) => report.id !== reportId)
    );
  };

  // Return object with the correct property name
  return {
    transactionReports,
    error,
    loading,
    refreshData,
    removeReportFromList,
    setTransactionReports,
  };
};

export default useFetchAllTransactionReportsData;
