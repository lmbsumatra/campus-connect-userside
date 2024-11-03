import React, { useState, useEffect } from "react";

const FetchUserInfo = (token) => {
  const [user, setUser] = useState({});
  const [student, setStudent] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      setErrorMessage(""); // Reset error message on new fetch

      try {
        const res = await fetch(`http://localhost:3001/user/info`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || {});
          setStudent(data.student || {});
        } else {
          const errorData = await res.json();
          setErrorMessage(errorData.message || "Getting user info failed. Please try again.");
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred while getting user info. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  return { user, student, errorMessage, loading };
};

export default FetchUserInfo;
