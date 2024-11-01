import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore user from local storage
      console.log("Restored user from localStorage:", JSON.parse(storedUser));
    }
  }, []);

  const login = (token, role) => {
    const newUser = { role, token };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser)); // Save user as JSON string
    console.log("User logged in:", newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
