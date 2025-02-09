import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios";

const BASE_URL = "http://localhost:3001/listings/available";

const initialState = {
  allApprovedListings: [],
  loadingAllApprovedListings: false,
  errorAllApprovedListings: null,
};

export const fetchAllApprovedListings = createAsyncThunk(
  "listing/allApprovedListings",
  async (keyword = "") => {
    const url = keyword
      ? `${BASE_URL}?q=${encodeURIComponent(keyword)}`
      : BASE_URL;
    const response = await fetch(url);
    return response.json();
  }
);

const allApprovedPostsSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllApprovedListings.pending, (state) => {
        state.loadingAllApprovedListings = true;
      })
      .addCase(fetchAllApprovedListings.fulfilled, (state, action) => {
        state.loadingAllApprovedListings = false;
        state.allApprovedListings = action.payload;
      })
      .addCase(fetchAllApprovedListings.rejected, (state, action) => {
        state.loadingAllApprovedListings = false;
        state.errorAllApprovedListings = action.error.message;
      });
  },
});

export default allApprovedPostsSlice.reducer;
