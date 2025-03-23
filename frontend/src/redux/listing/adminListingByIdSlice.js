import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/listings/admin`;

const initialState = {
  adminListingById: null,
  loadingAdminListingById: false,
  errorAdminListingById: null,
};

export const fetchAdminListingById = createAsyncThunk(
  "listing/fetchAdminListingById",
  async ({ id }, { rejectWithValue }) => {
    try {
      // console.log("Fetching listing with ID:", id);
      const response = await axios.get(`${BASE_URL}/get/${id}`);
      // console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      // console.error("Error fetching listing:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminListingByIdSlice = createSlice({
  name: "adminListing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminListingById.pending, (state) => {
        state.loadingAdminListingById = true;
        state.errorAdminListingById = null;
        state.adminListingById = null;
      })
      .addCase(fetchAdminListingById.fulfilled, (state, action) => {
        state.loadingAdminListingById = false;
        state.adminListingById = action.payload;
      })
      .addCase(fetchAdminListingById.rejected, (state, action) => {
        state.loadingAdminListingById = false;
        state.errorAdminListingById = action.error.message;
      });
  },
});

export default adminListingByIdSlice.reducer;
