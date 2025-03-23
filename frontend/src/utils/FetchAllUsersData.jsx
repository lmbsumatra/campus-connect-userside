import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "./consonants";

const useFetchAllUsersData = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseApi}/user/`);
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, error, loading };
};

export default useFetchAllUsersData;
