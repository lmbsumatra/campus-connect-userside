import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); 
      console.log("Restored user from localStorage:", JSON.parse(storedUser));
    }
  }, []);

  const login = (token, role, userId) => {
    const newUser = { role, token, userId };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
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
