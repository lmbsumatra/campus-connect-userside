import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for your backend API
const BASE_URL = "http://localhost:3001/review-and-rate/get";

// Initial state for reviews
const initialState = {
  userReviews: [],
  loadingUserReviews: false,
  errorUserReviews: null,
};

// Async thunk for fetching reviews by userId
export const fetchUserReviews = createAsyncThunk(
  "reviews/fetchUserReviews",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/user/${userId}`);
    console.log(userId, response.data);
    return response.data;
  }
);

// Slice for managing the reviews state
const userReviews = createSlice({
  name: "userReviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReviews.pending, (state) => {
        state.loadingUserReviews = true;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loadingUserReviews = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loadingUserReviews = false;
        state.errorUserReviews = action.error.message;
      });
  },
});

// Exporting the reducer to be used in the store
export default userReviews.reducer;
