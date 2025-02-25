import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState(null);
  const [studentUser, setStudentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(() => {
    // Retrieve the adminUser from local storage
    const savedUser = localStorage.getItem("adminUser");
    return savedUser ? JSON.parse(savedUser) : null; // Parse the stored JSON string
  });

  useEffect(() => {
    const storedAdminUser = localStorage.getItem("adminUser");

    if (storedAdminUser) {
      setAdminUser(JSON.parse(storedAdminUser));
      // console.log("Restored admin from localStorage:", JSON.parse(storedAdminUser));
    }
  }, []);
  useEffect(() => {
    const storedStudentUser = localStorage.getItem("studentUser");
    if (storedStudentUser) {
      setStudentUser(JSON.parse(storedStudentUser));
      // console.log("Restored student from localStorage:", JSON.parse(storedStudentUser));
    }
  }, []);

  const loginStudent = (token, role, userId) => {
    const newUser = { role, token, userId };
    setStudentUser(newUser);
    localStorage.setItem("studentUser", JSON.stringify(newUser));
    console.log("User logged in:", newUser);
  };

  const logoutStudent = () => {
    setStudentUser(null);
    localStorage.removeItem("studentUser");
  };

  const loginAdmin = (token, role, userId, firstName, lastName) => {
    const newUser = { role, token, userId, firstName, lastName }; // Add firstName and lastName
    setAdminUser(newUser);
    localStorage.setItem("adminUser", JSON.stringify(newUser));
    console.log("Admin logged in:", newUser);
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem("adminUser");
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        studentUser,
        loginStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
