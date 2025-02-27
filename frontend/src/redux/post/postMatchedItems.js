import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3001/posts/";

const initialState = {
  postMatchedItems: [],
  loadingPostMatchedItems: false,
  errorPostMatchedItems: null,
};

export const fetchPostMatchedItems = createAsyncThunk(
  "post/fetchPostMatchedItems",
  async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/matched-items`);
    const data = await response.json(); // Parse JSON
    console.log("matched", data.matchedItems); // Log parsed data
    return data.matchedItems; // Return parsed data
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
