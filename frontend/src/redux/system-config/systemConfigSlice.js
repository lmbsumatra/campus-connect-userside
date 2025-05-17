import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/api/system-config/`;

// Load cached config from localStorage on startup
const loadCachedConfig = () => {
  try {
    const cached = localStorage.getItem('systemConfig');
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error("Error loading cached system config:", error);
    return {};
  }
};

export const fetchSystemConfig = createAsyncThunk(
  "systemConfig/fetchSystemConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      // Cache the config in localStorage
      localStorage.setItem('systemConfig', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSystemConfig = createAsyncThunk(
  "systemConfig/updateSystemConfig",
  async ({ config, config_value }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(
        `${baseApi}/api/system-config/${config}`,
        { config_value }
      );
      
      // Update the localStorage cache with the new value
      try {
        const currentConfig = getState().systemConfig.config;
        const updatedConfig = { ...currentConfig, ...response.data };
        localStorage.setItem('systemConfig', JSON.stringify(updatedConfig));
      } catch (e) {
        console.error("Error updating config cache:", e);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const systemConfigSlice = createSlice({
  name: "systemConfig",
  initialState: {
    config: loadCachedConfig(), // Start with cached values
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.error = null;
      })
      .addCase(fetchSystemConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSystemConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = { ...state.config, ...action.payload };
        state.error = null;
      })
      .addCase(updateSystemConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default systemConfigSlice.reducer;
