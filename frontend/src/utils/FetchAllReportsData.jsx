import { useEffect, useState } from "react";
import axios from "axios";

const useFetchAllReportsData = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/reports`);
        setReports(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return { reports, error, loading };
};

export default useFetchAllReportsData;
