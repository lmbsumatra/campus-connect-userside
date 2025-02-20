import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3001/posts/available";

const initialState = {
  approvedPostById: [],
  loadingApprovedPostById: false,
  errorApprovedPostById: null,
};

export const fetchApprovedPostById = createAsyncThunk(
  "post/fetchApprovedPostById",
  async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    console.log(response.data)
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
