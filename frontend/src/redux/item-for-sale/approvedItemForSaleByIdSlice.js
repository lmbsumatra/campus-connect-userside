import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/item-for-sale/available`;

const initialState = {
  approvedItemForSaleById: [],
  loadingApprovedItemForSaleById: false,
  errorApprovedItemForSaleById: null,
};

export const fetchApprovedItemForSaleById = createAsyncThunk(
  "item-for-sale/fetchApprovedItemForSaleById",
  async (id, { rejectWithValue, getState }) => {
    const state = getState();
    const { studentUser } = state.studentAuth || {};

    // Initialize URLSearchParams for query parameters
    const params = new URLSearchParams();
    if (studentUser && studentUser.userId) {
      params.append("userId", studentUser.userId);
    }

    // Construct the URL with query parameters if they exist
    let url = `${BASE_URL}/${id}`;
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const approvedItemForSaleByIdSlice = createSlice({
  name: "ittem-for-sale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedItemForSaleById.pending, (state) => {
        state.loadingApprovedItemForSaleById = true;
      })
      .addCase(fetchApprovedItemForSaleById.fulfilled, (state, action) => {
        state.loadingApprovedItemForSaleById = false;
        state.approvedItemForSaleById = action.payload;
      })
      .addCase(fetchApprovedItemForSaleById.rejected, (state, action) => {
        state.loadingApprovedItemForSaleById = false;
        state.errorApprovedItemForSaleById = action.error.message;
      });
  },
});

export default approvedItemForSaleByIdSlice.reducer;
