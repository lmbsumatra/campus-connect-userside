import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/item-for-sale/users"; // Base URL for your API endpoint

const initialState = {
  allItemForSaleByUser: [],
  deleteStatus: null,
  loadingAllItemForSaleByUser: false,
  deletingItemForSale: false, // Optional separate state for delete loading
  errorAllItemForSaleByUser: null,
  deleteError: null, // Optional specific state for delete errors
};

// Create async thunk to fetch all ItemForSale by user
export const fetchAllItemForSaleByUser = createAsyncThunk(
  "ItemForSale/fetchAllItemForSaleByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    console.log(userId, response);
    return response.data;
  }
);

// Create async thunk to delete a ItemForSaleById by ID
export const deleteItemForSaleById = createAsyncThunk(
  "ItemForSale/deleteItemForSaleById",
  async ({ userId, itemForSaleId }, { rejectWithValue }) => {
    console.log(userId, itemForSaleId);
    try {
      await axios.delete(`${BASE_URL}/${userId}/delete/${itemForSaleId}`);
      return itemForSaleId; // Return the ID of the deleted itemForSaleId
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete item for sale"
      );
    }
  }
);

// Slice Definition
const allItemForSaleByUser = createSlice({
  name: "ItemForSale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch ItemForSale Cases
      .addCase(fetchAllItemForSaleByUser.pending, (state) => {
        state.loadingAllItemForSaleByUser = true;
        state.allItemForSaleByUser = null;
      })
      .addCase(fetchAllItemForSaleByUser.fulfilled, (state, action) => {
        state.loadingAllItemForSaleByUser = false;
        state.allItemForSaleByUser = action.payload;
      })
      .addCase(fetchAllItemForSaleByUser.rejected, (state, action) => {
        state.loadingAllItemForSaleByUser = false;
        state.errorAllItemForSaleByUser = action.error.message;
      })

      // Delete itemForSaleId Cases
      .addCase(deleteItemForSaleById.pending, (state) => {
        state.deletingItemForSale = true; // Show loading for delete
        state.deleteError = null; // Reset error
        state.deleteStatus = null;
      })
      .addCase(deleteItemForSaleById.fulfilled, (state, action) => {
        state.ItemForSaleById = false; // Stop loading
        state.allItemForSaleByUser = state.allItemForSaleByUser.filter(
          (item) => item.id !== action.payload
        );
        state.deleteStatus = "success";
      })
      .addCase(deleteItemForSaleById.rejected, (state, action) => {
        state.deletingItemForSale = false; // Stop loading
        state.deleteError = action.payload; // Capture the error
        state.deleteStatus = "failed";
      });
  },
});

export default allItemForSaleByUser.reducer;
