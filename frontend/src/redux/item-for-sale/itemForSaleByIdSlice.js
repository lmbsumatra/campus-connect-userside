import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/item-for-sale/users`;

const initialState = {
  itemForSaleById: null, // item data (e.g., {id, name, rate, etc.})
  loadingItemForSaleById: false, // loading state
  errorItemForSaleById: null, // error state
};

// Asynchronous action using createAsyncThunk with axios
export const fetchItemForSaleById = createAsyncThunk(
  "itemForSale/fetchItemForSaleById",
  async ({ userId, itemForSaleId }) => {
    const response = await axios.get(
      `${BASE_URL}/${userId}/get/${itemForSaleId}`
    );
    return response.data;
  }
);

const itemForSaleByIdSlice = createSlice({
  name: "itemForSale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemForSaleById.pending, (state) => {
        state.loadingItemForSaleById = true;
        state.errorItemForSaleById = null; // Clear previous error
        state.itemForSaleById = null; // Clear previous data
      })
      .addCase(fetchItemForSaleById.fulfilled, (state, action) => {
        state.loadingItemForSaleById = false;
        state.itemForSaleById = action.payload;
      })
      .addCase(fetchItemForSaleById.rejected, (state, action) => {
        state.loadingItemForSaleById = false;
        state.errorItemForSaleById = action.error.message;
      });
  },
});

export default itemForSaleByIdSlice.reducer;
