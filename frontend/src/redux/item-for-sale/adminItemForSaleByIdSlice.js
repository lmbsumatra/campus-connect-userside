import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/item-for-sale/admin`;

const initialState = {
  adminItemForSaleById: null,
  loadingAdminItemForSaleById: false,
  errorAdminItemForSaleById: null,
};

export const fetchAdminItemForSaleById = createAsyncThunk(
  "itemforsale/fetchAdminItemForSaleById",
  async ({ id }, { rejectWithValue }) => {
    try {
      // console.log("Fetching ItemForSale with ID:", id);
      const response = await axios.get(`${BASE_URL}/get/${id}`);
      // console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      // console.error("Error fetching ItemForSale:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminItemForSaleByIdSlice = createSlice({
  name: "adminItemForSale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminItemForSaleById.pending, (state) => {
        state.loadingAdminItemForSaleById = true;
        state.errorAdminItemForSaleById = null;
        state.adminItemForSaleById = null;
      })
      .addCase(fetchAdminItemForSaleById.fulfilled, (state, action) => {
        state.loadingAdminItemForSaleById = false;
        state.adminItemForSaleById = action.payload;
      })
      .addCase(fetchAdminItemForSaleById.rejected, (state, action) => {
        state.loadingAdminItemForSaleById = false;
        state.errorAdminItemForSaleById = action.error.message;
      });
  },
});

export default adminItemForSaleByIdSlice.reducer;
