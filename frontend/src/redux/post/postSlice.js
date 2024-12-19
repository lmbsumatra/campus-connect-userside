import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios";

const BASE_URL = "http://localhost:3001/posts/available";

const initialState = {
  post: [],
  loading: false,
  error: null,
};

export const fetchPostDetails = createAsyncThunk(
  "product/fetchProductDetails",
  async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    return response.json();
  }
);

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload;
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default postSlice.reducer;