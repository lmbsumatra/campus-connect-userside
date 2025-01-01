import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://192.168.100.34:3001/item-for-sale/users";

const initialState = {
  itemForSaleById: null,  // item data (e.g., {id, name, rate, etc.})
  loadingItemForSaleById: false,  // loading state
  errorItemForSaleById: null,  // error state
};

// Asynchronous action using createAsyncThunk with axios
export const fetchItemForSaleById = createAsyncThunk(
  "itemForSale/fetchItemForSaleById",
  async ({ userId, itemForSaleId }) => {
    const response = await axios.get(`${BASE_URL}/${userId}/get/${itemForSaleId}`);
    console.log("HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", response.data, userId, itemForSaleId )
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
