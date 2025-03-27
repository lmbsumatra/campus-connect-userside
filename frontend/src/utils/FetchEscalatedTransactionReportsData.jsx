import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "./consonants";
import { useAuth } from "../context/AuthContext";

const useFetchEscalatedTransactionReportsData = () => {
  const [escalatedReports, setEscalatedReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adminUser } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      if (!adminUser?.token) {
        setError("Admin authentication token not found.");
        setLoading(false);
        return;
      }
      setLoading(true); // Set loading true at the start of fetch
      try {
        const response = await axios.get(
          `${baseApi}/api/transaction-reports/escalated`,
          {
            // Use the new endpoint
            headers: {
              Authorization: `Bearer ${adminUser.token}`,
            },
          }
        );
        setEscalatedReports(response.data);
        setError(null); // Clear previous errors on success
      } catch (err) {
        console.error("Failed to fetch escalated transaction reports:", err);
        setError(err.response?.data?.error || err.message);
        setEscalatedReports([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [adminUser?.token]);

  // Function to manually update the list after an admin action
  const updateReportInList = (updatedReport) => {
    setEscalatedReports(
      (prevReports) =>
        prevReports.map((report) =>
          report.id === updatedReport.id ? updatedReport : report
        )
      // Optionally filter out reports that are no longer 'escalated' or 'admin_review'
      // .filter(report => ['escalated', 'admin_review'].includes(report.status))
    );
  };

  // Function to remove a report from the list (e.g., after resolving/dismissing)
  const removeReportFromList = (reportId) => {
    setEscalatedReports((prevReports) =>
      prevReports.filter((report) => report.id !== reportId)
    );
  };

  return {
    escalatedReports,
    error,
    loading,
    updateReportInList,
    removeReportFromList,
  };
};

export default useFetchEscalatedTransactionReportsData;
