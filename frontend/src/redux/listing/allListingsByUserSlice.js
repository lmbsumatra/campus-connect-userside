import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/listings/users`;

const initialState = {
  allListingsByUser: [],
  deleteStatus: null,
  loadingAllListingsByUser: false,
  deletingListing: false,
  errorAllListingsByUser: null,
  deleteError: null,
};

export const fetchAllListingsByUser = createAsyncThunk(
  "listings/fetchAllListingsByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}`);

    return response.data;
  }
);

export const deleteListingById = createAsyncThunk(
  "listings/deleteListingById",
  async ({ userId, listingId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/${userId}/delete/${listingId}`);
      return listingId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete listing"
      );
    }
  }
);

const allListingsByUser = createSlice({
  name: "listings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllListingsByUser.pending, (state) => {
        state.loadingAllListingsByUser = true;
        state.allListingsByUser = null;
      })
      .addCase(fetchAllListingsByUser.fulfilled, (state, action) => {
        state.loadingAllListingsByUser = false;
        state.allListingsByUser = action.payload;
      })
      .addCase(fetchAllListingsByUser.rejected, (state, action) => {
        state.loadingAllListingsByUser = false;
        state.errorAllListingsByUser = action.error.message;
      })

      .addCase(deleteListingById.pending, (state) => {
        state.deletingListing = true;
        state.deleteError = null;
        state.deleteStatus = null;
      })
      .addCase(deleteListingById.fulfilled, (state, action) => {
        state.deletingListing = false;
        state.allListingsByUser = state.allListingsByUser.filter(
          (listing) => listing.id !== action.payload
        );
        state.deleteStatus = "success";
      })
      .addCase(deleteListingById.rejected, (state, action) => {
        state.deletingListing = false;
        state.deleteError = action.payload;
        state.deleteStatus = "failed";
      });
  },
});

export default allListingsByUser.reducer;
