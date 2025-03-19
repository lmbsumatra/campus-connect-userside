import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/posts/users"; // Base URL for your API endpoint

const initialState = {
  allPostsByUser: [],
  deleteStatus: null,
  loadingAllPostsByUser: false,
  deletingPost: false, // Optional separate state for delete loading
  errorPostByUser: null,
  deleteError: null, // Optional specific state for delete errors
};

// Create async thunk to fetch all ItemForSale by user
export const fetchAllPostsByUser = createAsyncThunk(
  "Post/fetchAllPostsByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    // console.log(userId, response);
    return response.data;
  }
);

// Create async thunk to delete a ItemForSaleById by ID
export const deletePostById = createAsyncThunk(
  "Post/deletePostById",
  async ({ userId, postId }, { rejectWithValue }) => {
    // console.log(userId, postId);
    try {
      await axios.delete(`${BASE_URL}/${userId}/delete/${postId}`);
      return postId; // Return the ID of the deleted itemForSaleId
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete item for sale"
      );
    }
  }
);

// Slice Definition
const allPostsByUser = createSlice({
  name: "Post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch ItemForSale Cases
      .addCase(fetchAllPostsByUser.pending, (state) => {
        state.loadingAllPostsByUser = true;
        state.allPostsByUser = [];
      })
      .addCase(fetchAllPostsByUser.fulfilled, (state, action) => {
        state.loadingAllPostsByUser = false;
        state.allPostsByUser = action.payload;
      })
      .addCase(fetchAllPostsByUser.rejected, (state, action) => {
        state.loadingAllPostsByUser = false;
        state.errorPostByUser = action.error.message;
      })

      // Delete itemForSaleId Cases
      .addCase(deletePostById.pending, (state) => {
        state.deletingPost = true; // Show loading for delete
        state.deleteError = null; // Reset error
        state.deleteStatus = null;
      })
      .addCase(deletePostById.fulfilled, (state, action) => {
        state.deletingPost = false; // Stop loading
        state.allPostsByUser = state.allPostsByUser.filter(
          (item) => item.id !== action.payload
       || [] );
        state.deleteStatus = "success";
      })
      .addCase(deletePostById.rejected, (state, action) => {
        state.deletingPost = false; // Stop loading
        state.deleteError = action.payload; // Capture the error
        state.deleteStatus = "failed";
      });
  },
});

export default allPostsByUser.reducer;
