import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/posts/user`;

const initialState = {
  availablePostsByUser: [],
  loadingAvailablePostsByUser: false,
  errorAvailablePostsByUser: null,
};

export const fetchAvailablePostsByUser = createAsyncThunk(
  "listings/AvailablePostsByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}/available`);
    // console.log(userId, response.data);
    return response.data;
  }
);

const availablePostsByUser = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailablePostsByUser.pending, (state) => {
        state.loadingAvailablePostsByUser = true;
      })
      .addCase(fetchAvailablePostsByUser.fulfilled, (state, action) => {
        state.loadingAvailablePostsByUser = false;
        state.availablePostsByUser = action.payload;
      })
      .addCase(fetchAvailablePostsByUser.rejected, (state, action) => {
        state.loadingAvailablePostsByUser = false;
        state.errorAvailablePostsByUser = action.error.message;
      });
  },
});

export default availablePostsByUser.reducer;
