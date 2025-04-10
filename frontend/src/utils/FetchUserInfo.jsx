import React, { useState, useEffect } from "react";
import { selectStudentUser } from "../redux/auth/studentAuthSlice";
import { useSelector } from "react-redux";
import { baseApi } from "./consonants";

const FetchUserInfo = ({ userId }) => {
  const [user, setUser] = useState({});
  const [student, setStudent] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const studentUser = useSelector(selectStudentUser);
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const res = await fetch(`${baseApi}/user/info/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${studentUser.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || {});
          setStudent(data.student || {});
        } else {
          const errorData = await res.json();
          setErrorMessage(
            errorData.message || "Getting user info failed. Please try again."
          );
        }
      } catch (error) {
        setErrorMessage(
          "An unexpected error occurred while getting user info. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  return { user, student, errorMessage, loading };
};

export default FetchUserInfo;
