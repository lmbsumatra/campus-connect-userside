import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios";

const BASE_URL = "http://192.168.100.34:3001/posts/available";

const initialState = {
  approvedPostById: [],
  loadingApprovedPostById: false,
  errorApprovedPostById: null,
};

export const fetchApprovedPostById = createAsyncThunk(
  "post/etchApprovedPostById",
  async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    return response.json();
  }
);

const approvedPostByIdSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedPostById.pending, (state) => {
        state.loadingApprovedPostById = true;
      })
      .addCase(fetchApprovedPostById.fulfilled, (state, action) => {
        state.loadingApprovedPostById = false;
        state.approvedPostById = action.payload;
      })
      .addCase(fetchApprovedPostById.rejected, (state, action) => {
        state.loadingApprovedPostById = false;
        state.errorApprovedPostById = action.error.message;
      });
  },
});

export default approvedPostByIdSlice.reducer;