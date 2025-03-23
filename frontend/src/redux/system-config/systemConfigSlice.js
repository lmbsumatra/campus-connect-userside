import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/api/system-config/`;

export const fetchSystemConfig = createAsyncThunk(
  "systemConfig/fetchSystemConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSystemConfig = createAsyncThunk(
  "systemConfig/updateSystemConfig",
  async ({ config, config_value }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${baseApi}/api/system-config/${config}`,
        { config_value }
      );
        return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const systemConfigSlice = createSlice({
  name: "systemConfig",
  initialState: {
    config: {},
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
