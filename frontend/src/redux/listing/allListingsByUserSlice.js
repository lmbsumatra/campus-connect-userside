import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/listings/users"; // Base URL for your API endpoint

const initialState = {
  allListingsByUser: [],
  deleteStatus: null,
  loadingAllListingsByUser: false,
  deletingListing: false, // Optional separate state for delete loading
  errorAllListingsByUser: null,
  deleteError: null, // Optional specific state for delete errors
};

// Create async thunk to fetch all listings by user
export const fetchAllListingsByUser = createAsyncThunk(
  "listings/fetchAllListingsByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    console.log(userId, response);
    return response.data;
  }
);

// Create async thunk to delete a listing by ID
export const deleteListingById = createAsyncThunk(
  "listings/deleteListingById",
  async ({ userId, listingId }, { rejectWithValue }) => {
    console.log(userId, listingId);
    try {
      await axios.delete(`${BASE_URL}/${userId}/delete/${listingId}`);
      return listingId; // Return the ID of the deleted listing
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete listing"
      );
    }
  }
);

// Slice Definition
const allListingsByUser = createSlice({
  name: "listings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Listings Cases
      .addCase(fetchAllListingsByUser.pending, (state) => {
        state.loadingAllListingsByUser = true;
      })
      .addCase(fetchAllListingsByUser.fulfilled, (state, action) => {
        state.loadingAllListingsByUser = false;
        state.allListingsByUser = action.payload;
      })
      .addCase(fetchAllListingsByUser.rejected, (state, action) => {
        state.loadingAllListingsByUser = false;
        state.errorAllListingsByUser = action.error.message;
      })

      // Delete Listing Cases
      .addCase(deleteListingById.pending, (state) => {
        state.deletingListing = true; // Show loading for delete
        state.deleteError = null; // Reset error
        state.deleteStatus = null;
      })
      .addCase(deleteListingById.fulfilled, (state, action) => {
        state.deletingListing = false; // Stop loading
        state.allListingsByUser = state.allListingsByUser.filter(
          (listing) => listing.id !== action.payload
        );
        state.deleteStatus = "success";
      })
      .addCase(deleteListingById.rejected, (state, action) => {
        state.deletingListing = false; // Stop loading
        state.deleteError = action.payload; // Capture the error
        state.deleteStatus = "failed";
      });
  },
});

export default allListingsByUser.reducer;
