import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/listings/available`;

const initialState = {
  allApprovedListings: [],
  loadingAllApprovedListings: false,
  errorAllApprovedListings: null,
};

export const fetchAllApprovedListings = createAsyncThunk(
  "listing/allApprovedListings",
  async ({ keyword = "", preference = "" }, { getState }) => {
    const state = getState();

    const { studentUser } = state.studentAuth || {};

    let url = BASE_URL;
    const params = new URLSearchParams();

    if (keyword) params.append("q", keyword);
    if (preference) params.append("preference", preference);
    if (studentUser && studentUser.userId)
      params.append("userId", studentUser.userId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

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
