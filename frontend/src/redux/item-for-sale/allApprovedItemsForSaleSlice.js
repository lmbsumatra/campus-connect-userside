import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/item-for-sale/available`;

const initialState = {
  allApprovedItemForSale: [],
  loadingAllApprovedItemForSale: false,
  errorAllApprovedItemForSale: null,
};

export const fetchAllApprovedItemForSale = createAsyncThunk(
  "item-for-sale/allApprovedItemForSale",
  async ({ keyword = "", preference = "" }, { getState }) => {
    const state = getState();

    const { studentUser } = state.studentAuth || {};

    let url = BASE_URL;
    const params = new URLSearchParams();

    if (keyword) params.append("q", keyword);
    if (preference) params.append("preference", preference);
    if (studentUser && studentUser.userId)
      params.append("userId", studentUser.userId); // Customization

    if (params.toString()) {
      url += `?${params.toString()}`;

      console.log(url);
    }
    const response = await fetch(url);
    return response.json();
  }
);

const allApprovedItemForSaleSlice = createSlice({
  name: "item-for-sale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllApprovedItemForSale.pending, (state) => {
        state.loadingAllApprovedItemForSale = true;
      })
      .addCase(fetchAllApprovedItemForSale.fulfilled, (state, action) => {
        state.loadingAllApprovedItemForSale = false;
        state.allApprovedItemForSale = action.payload;
      })
      .addCase(fetchAllApprovedItemForSale.rejected, (state, action) => {
        state.loadingAllApprovedItemForSale = false;
        state.errorAllApprovedItemForSale = action.error.message;
      });
  },
});

export default allApprovedItemForSaleSlice.reducer;
