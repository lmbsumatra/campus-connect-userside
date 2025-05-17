import React, { createContext, useContext, useEffect } from "react";
import { fetchSystemConfig } from "../redux/system-config/systemConfigSlice";
import { useDispatch, useSelector } from "react-redux";

const SystemConfigContext = createContext();

export const SystemConfigProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { config, loading, error } = useSelector((state) => state.systemConfig);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchSystemConfig());

    // Set up a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      dispatch(fetchSystemConfig());
    }, 300000); // 5 minutes = 300000 ms
    
    // Clean up on unmount
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  useEffect(() => {}, [config]);

  return (
    <SystemConfigContext.Provider value={{ config, loading }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

export const useSystemConfig = () => {
  return useContext(SystemConfigContext);
};
