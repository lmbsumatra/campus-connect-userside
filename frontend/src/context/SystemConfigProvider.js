import React, { createContext, useContext, useEffect } from "react";
import { fetchSystemConfig } from "../redux/system-config/systemConfigSlice";
import { useDispatch, useSelector } from "react-redux";

const SystemConfigContext = createContext();

export const SystemConfigProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { config, loading, error } = useSelector((state) => state.systemConfig);

  useEffect(() => {
    dispatch(fetchSystemConfig());
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
