import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/posts/users";

const initialState = {
  postById: null, // item data (e.g., {id, name, rate, etc.})
  loadingPostById: false, // loading state
  errorPostById: null, // error state
};

// Asynchronous action using createAsyncThunk with axios
export const fetchPostById = createAsyncThunk(
  "post/fetchPostById",
  async ({ userId, postId }) => {
    const response = await axios.get(
      `${BASE_URL}/${userId}/get/${postId}`
    );
    return response.data;
  }
);

const postByIdSlice = createSlice({
  name: "itemForSale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostById.pending, (state) => {
        state.loadingPostById = true;
        state.errorPostById = null; // Clear previous error
        state.postById = null; // Clear previous data
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loadingPostById = false;
        state.postById = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loadingPostById = false;
        state.errorPostById = action.error.message;
      });
  },
});

export default postByIdSlice.reducer;
