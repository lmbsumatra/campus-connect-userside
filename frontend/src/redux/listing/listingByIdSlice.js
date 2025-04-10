import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/listings/users`;

const initialState = {
  listingById: null, // item data (e.g., {id, name, rate, etc.})
  loadingListingById: false, // loading state
  errorListingById: null, // error state
};

// Asynchronous action using createAsyncThunk with axios
export const fetchListingById = createAsyncThunk(
  "listing/fetchListingById",
  async ({ userId, listingId }) => {
    const response = await axios.get(`${BASE_URL}/${userId}/get/${listingId}`);
    return response.data;
  }
);

const listingByIdSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchListingById.pending, (state) => {
        state.loadingListingById = true;
        state.errorListingById = null; // Clear previous error
        state.listingById = null;
      })
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.loadingListingById = false;
        state.listingById = action.payload;
      })
      .addCase(fetchListingById.rejected, (state, action) => {
        state.loadingListingById = false;
        state.errorListingById = action.error.message;
      });
  },
});

export default listingByIdSlice.reducer;
