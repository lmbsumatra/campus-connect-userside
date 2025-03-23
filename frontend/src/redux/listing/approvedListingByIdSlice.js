import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/listings/available`;

const initialState = {
  approvedListingById: [],
  loadingApprovedListingById: false,
  errorApprovedListingById: null,
};

// Asynchronous action using createAsyncThunk with axios
export const fetchApprovedListingById = createAsyncThunk(
  "listing/fetchApprovedListingById",
  async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  }
);

const approvedListingByIdSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedListingById.pending, (state) => {
        state.loadingApprovedListingById = true;
      })
      .addCase(fetchApprovedListingById.fulfilled, (state, action) => {
        state.loadingApprovedListingById = false;
        state.approvedListingById = action.payload;
      })
      .addCase(fetchApprovedListingById.rejected, (state, action) => {
        state.loadingApprovedListingById = false;
        state.errorApprovedListingById = action.error.message;
      });
  },
});

export default approvedListingByIdSlice.reducer;
