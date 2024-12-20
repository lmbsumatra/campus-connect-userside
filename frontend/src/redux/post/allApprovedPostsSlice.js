import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios";

const BASE_URL = "http://localhost:3001/posts/approved";

const initialState = {
  allApprovedPosts: [],
  loadingAllApprovedPosts: false,
  errorAllApprovedPosts: null,
};

export const fetchAllApprovedPosts = createAsyncThunk(
  "post/allApprovedPosts",
  async () => {
    const response = await fetch(BASE_URL);

    console.log(response);
    return response.json();
  }
);

const allApprovedPostsSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllApprovedPosts.pending, (state) => {
        state.loadingAllApprovedPosts = true;
      })
      .addCase(fetchAllApprovedPosts.fulfilled, (state, action) => {
        state.loadingAllApprovedPosts = false;
        state.allApprovedPosts = action.payload;
      })
      .addCase(fetchAllApprovedPosts.rejected, (state, action) => {
        state.loadingAllApprovedPosts = false;
        state.errorAllApprovedPosts = action.error.message;
      });
  },
});

export default allApprovedPostsSlice.reducer;
