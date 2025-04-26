import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/posts/users`; 

const initialState = {
  allPostsByUser: [],
  deleteStatus: null,
  loadingAllPostsByUser: false,
  deletingPost: false, 
  errorPostByUser: null,
  deleteError: null,
};

export const fetchAllPostsByUser = createAsyncThunk(
  "Post/fetchAllPostsByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    return response.data;
  }
);

export const deletePostById = createAsyncThunk(
  "Post/deletePostById",
  async ({ userId, postId }, { rejectWithValue }) => {
   
    try {
      await axios.delete(`${BASE_URL}/${userId}/delete/${postId}`);
      return postId; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete item for sale"
      );
    }
  }
);


const allPostsByUser = createSlice({
  name: "Post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
  
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

    
      .addCase(deletePostById.pending, (state) => {
        state.deletingPost = true;
        state.deleteError = null; 
        state.deleteStatus = null;
      })
      .addCase(deletePostById.fulfilled, (state, action) => {
        state.deletingPost = false; 
        state.allPostsByUser = state.allPostsByUser.filter(
          (item) => item.id !== action.payload
       || [] );
        state.deleteStatus = "success";
      })
      .addCase(deletePostById.rejected, (state, action) => {
        state.deletingPost = false; 
        state.deleteError = action.payload;
        state.deleteStatus = "failed";
      });
  },
});

export default allPostsByUser.reducer;
