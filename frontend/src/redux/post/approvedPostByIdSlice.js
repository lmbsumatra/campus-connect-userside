import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/posts/available`;

const initialState = {
  approvedPostById: [],
  loadingApprovedPostById: false,
  errorApprovedPostById: null,
};

export const fetchApprovedPostById = createAsyncThunk(
  "post/fetchApprovedPostById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);

      if (!response.ok) {
        // If response is not OK (e.g., 404), throw an error
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch post");
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
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
        state.errorApprovedPostById = null; // Clear previous errors on new request
      })
      .addCase(fetchApprovedPostById.fulfilled, (state, action) => {
        state.loadingApprovedPostById = false;
        state.approvedPostById = action.payload;
      })
      .addCase(fetchApprovedPostById.rejected, (state, action) => {
        state.loadingApprovedPostById = false;
        state.errorApprovedPostById = action.payload; // Now stores the correct error
      });
  },
});

export default approvedPostByIdSlice.reducer;
