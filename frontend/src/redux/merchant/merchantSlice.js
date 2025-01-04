import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3001/user/merchant-details";

// Async thunk for fetching merchant data
export const fetchMerchant = createAsyncThunk(
  "merchant/fetchMerchant",
  async (id, { rejectWithValue }) => {
    
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log({ data });
      return data; // Expecting { merchantSettings, payoutSettings, payoutSchedule }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating merchant data
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
      state.errorFetchMerchant = null;
      state.errorUpdateMerchant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchMerchant lifecycle
      .addCase(fetchMerchant.pending, (state) => {
        state.loadingFetchMerchant = true;
        state.errorFetchMerchant = null;
      })
      .addCase(fetchMerchant.fulfilled, (state, action) => {
        console.log('Fulfilled payload:', action.payload);
        const { merchantSettings, payoutSettings, payoutSchedule } =
          action.payload;
        state.loadingFetchMerchant = false;
        state.merchantSettings = merchantSettings;
        state.payoutSettings = payoutSettings;
        state.payoutSchedule = payoutSchedule;
        state.errorFetchMerchant = null;
      })
      .addCase(fetchMerchant.rejected, (state, action) => {
        state.loadingFetchMerchant = false;
        state.errorFetchMerchant = action.payload;
      })
      // Handle updateMerchant lifecycle
      .addCase(updateMerchant.pending, (state) => {
        state.loadingUpdateMerchant = true;
        state.errorUpdateMerchant = null;
      })
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.loadingUpdateMerchant = false;
        // Update relevant parts of the state based on the updates returned
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
