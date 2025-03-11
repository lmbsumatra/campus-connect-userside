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
  async (keyword = "", { getState }) => {
    const state = getState();

    const { studentUser } = state.studentAuth || {};

    let url = BASE_URL;
    const params = new URLSearchParams();

    if (keyword) params.append("q", keyword);
    if (studentUser && studentUser.userId)
      params.append("userId", studentUser.userId); // Customization

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log(url);
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
