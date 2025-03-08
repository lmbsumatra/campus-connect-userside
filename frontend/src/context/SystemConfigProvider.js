import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "../App";
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

// Custom hook to use system config
export const useSystemConfig = () => {
  return useContext(SystemConfigContext);
};
