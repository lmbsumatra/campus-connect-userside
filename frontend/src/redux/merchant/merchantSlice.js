import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/user/merchant-details`;

export const fetchMerchant = createAsyncThunk(
  "merchant/fetchMerchant",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMerchant = createAsyncThunk(
  "merchant/updateMerchant",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const merchantSlice = createSlice({
  name: "merchant",
  initialState: {
    merchantSettings: null,
    payoutSettings: null,
    payoutSchedule: null,
    status: [],
    message: "",
    loadingFetchMerchant: false,
    loadingUpdateMerchant: false,
    errorFetchMerchant: null,
    errorUpdateMerchant: null,
  },
  reducers: {
    clearMerchantData: (state) => {
      state.merchantSettings = null;
      state.payoutSettings = null;
      state.payoutSchedule = null;
      state.status = [];
      state.message = "";
      state.errorFetchMerchant = null;
      state.errorUpdateMerchant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMerchant.pending, (state) => {
        state.loadingFetchMerchant = true;
        state.errorFetchMerchant = null;
      })
      .addCase(fetchMerchant.fulfilled, (state, action) => {
        const {
          merchantSettings,
          payoutSettings,
          payoutSchedule,
          status,
          message,
        } = action.payload;
        state.loadingFetchMerchant = false;
        state.merchantSettings = merchantSettings;
        state.payoutSettings = payoutSettings;
        state.status = status;
        state.message = message;
        state.payoutSchedule = payoutSchedule;
        state.errorFetchMerchant = null;
      })
      .addCase(fetchMerchant.rejected, (state, action) => {
        state.loadingFetchMerchant = false;
        state.errorFetchMerchant = action.payload;
      })
      .addCase(updateMerchant.pending, (state) => {
        state.loadingUpdateMerchant = true;
        state.errorUpdateMerchant = null;
      })
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.loadingUpdateMerchant = false;
        if (action.payload.merchantSettings) {
          state.merchantSettings = {
            ...state.merchantSettings,
            ...action.payload.merchantSettings,
          };
        }
        if (action.payload.payoutSettings) {
          state.payoutSettings = {
            ...state.payoutSettings,
            ...action.payload.payoutSettings,
          };
        }
        if (action.payload.payoutSchedule) {
          state.payoutSchedule = action.payload.payoutSchedule;
        }
        state.errorUpdateMerchant = null;
      })
      .addCase(updateMerchant.rejected, (state, action) => {
        state.loadingUpdateMerchant = false;
        state.errorUpdateMerchant = action.payload;
      });
  },
});

export const { clearMerchantData } = merchantSlice.actions;
export default merchantSlice.reducer;
