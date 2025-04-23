import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/posts/`;

const initialState = {
  postMatchedItems: [],
  loadingPostMatchedItems: false,
  errorPostMatchedItems: null,
};

export const fetchPostMatchedItems = createAsyncThunk(
  "post/fetchPostMatchedItems",
  async (id) => {
    try {
      const response = await fetch(`${BASE_URL}${id}/matched-items`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("matched", data.matchedItems); // Log parsed data
      return data.matchedItems;
    } catch (error) {
      // console.error("Error fetching matched items:", error);
      throw error; // Re-throw error so that it can be handled by createAsyncThunk's rejection handling
    }
  }
);

const postMatchedItemsSlice = createSlice({
  name: "post-matched-items",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostMatchedItems.pending, (state) => {
        state.loadingPostMatchedItems = true;
      })
      .addCase(fetchPostMatchedItems.fulfilled, (state, action) => {
        state.loadingApprovedPostById = false;
        state.postMatchedItems = action.payload;
      })
      .addCase(fetchPostMatchedItems.rejected, (state, action) => {
        state.loadingPostMatchedItems = false;
        state.errorPostMatchedItems = action.error.message;
      });
  },
});

export default postMatchedItemsSlice.reducer;
