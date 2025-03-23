import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { baseApi } from "./consonants";

const FetchUserInfoForAdmin = (userId) => {
  const { adminUser } = useAuth(); // Get admin token from AuthContext
  const [user, setUser] = useState({});
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId || !adminUser?.token) return;
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await axios.get(
          `${baseApi}/admin/student/info/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${adminUser.token}`,
            },
          }
        );

        setUser(response.data.user || {});
        setStudent(response.data.student || {});
      } catch (err) {
        setErrorMessage(err.response ? err.response.data.error : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId, adminUser]);

  return { user, student, loading, errorMessage };
};

export default FetchUserInfoForAdmin;
