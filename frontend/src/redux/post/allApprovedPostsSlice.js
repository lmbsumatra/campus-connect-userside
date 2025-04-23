import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";
const BASE_URL = `${baseApi}/posts/approved`;

const initialState = {
  allApprovedPosts: [],
  loadingAllApprovedPosts: false,
  errorAllApprovedPosts: null,
};

export const fetchAllApprovedPosts = createAsyncThunk(
  "post/allApprovedPosts",
  async ({ keyword = "", preference = "" }) => {
    const params = new URLSearchParams();

    if (keyword) params.append("q", keyword);
    if (preference) params.append("preference", preference);

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await fetch(url);


    if (!response.ok) {
      throw new Error("Failed to fetch approved posts");
    }

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
