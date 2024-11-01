import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role: 'admin', name: 'John' } or null if not logged in

  // Login function to set user role
  const login = (role) => {
    setUser({ role }); // Set role (e.g., 'student', 'admin', 'superadmin')
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
