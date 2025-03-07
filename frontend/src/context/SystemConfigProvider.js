import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "../App";

const SystemConfigContext = createContext();

export const SystemConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/system-config/`
        );
        setConfig(response.data);
        console.log(config); // when i try to print config its empty only response.data
      } catch (error) {
        console.error("Failed to fetch system config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {}, [config]);

  return (
    <SystemConfigContext.Provider value={{ config, loading }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

// Custom hook to use system config
export const useSystemConfig = () => {
  return useContext(SystemConfigContext);
};
