import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/posts/admin";

const initialState = {
  adminPostById: null,
  loadingAdminPostById: false,
  errorAdminPostById: null,
};

export const fetchAdminPostById = createAsyncThunk(
  "post/fetchAdminPostById",
  async ({ id }, { rejectWithValue }) => {
    try {
      // console.log("Fetching Post with ID:", id);
      const response = await axios.get(`${BASE_URL}/get/${id}`);
      // console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      // console.error("Error fetching Post:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminPostByIdSlice = createSlice({
  name: "adminPost",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPostById.pending, (state) => {
        state.loadingAdminPostById = true;
        state.errorAdminPostById = null;
        state.adminPostById = null;
      })
      .addCase(fetchAdminPostById.fulfilled, (state, action) => {
        state.loadingAdminPostById = false;
        state.adminPostById = action.payload;
      })
      .addCase(fetchAdminPostById.rejected, (state, action) => {
        state.loadingAdminPostById = false;
        state.errorAdminPostById = action.error.message;
      });
  },
});

export default adminPostByIdSlice.reducer;
