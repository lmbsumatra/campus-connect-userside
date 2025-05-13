import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

export const fetchStripeAdminOverview = createAsyncThunk(
  "stripeAdmin/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      // Get the token directly from localStorage
      let token = localStorage.getItem("adminToken");
      const refreshToken = localStorage.getItem("adminRefreshToken");

      if (!token || !refreshToken) {
        console.error("Missing authentication tokens");
        return rejectWithValue("Authentication required. Please log in again.");
      }

      // Attempt the API call with the token
      try {
        // console.log("Making API request to stripe-dashboard endpoint");
        const response = await axios.get(`${baseApi}/admin/stripe-dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        //console.log("API request successful");
        return response.data;
      } catch (apiError) {
        //console.error("API request failed:", apiError);

        // If the API call fails with 401/403, try refreshing token once
        if (
          apiError.response &&
          (apiError.response.status === 401 || apiError.response.status === 403)
        ) {
          console.log("Received 401/403 error, attempting token refresh");

          try {
            // Make refresh token request
            const refreshResponse = await axios.post(
              `${baseApi}/admin/refresh-token`,
              { refreshToken },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (refreshResponse.data.token) {
              // Store new tokens
              localStorage.setItem("adminToken", refreshResponse.data.token);
              localStorage.setItem(
                "adminRefreshToken",
                refreshResponse.data.refreshToken
              );

              // Retry API call with new token
              console.log("Retrying API call with refreshed token");
              const retryResponse = await axios.get(
                `${baseApi}/admin/stripe-dashboard`,
                {
                  headers: {
                    Authorization: `Bearer ${refreshResponse.data.token}`,
                  },
                }
              );
              console.log("Retry API call successful");
              return retryResponse.data;
            } else {
              return rejectWithValue(
                "Failed to refresh token. Please log in again."
              );
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            return rejectWithValue("Session expired. Please log in again.");
          }
        }

        // For other errors, pass through the error message
        return rejectWithValue(
          apiError.response?.data?.error || "Failed to fetch Stripe overview"
        );
      }
    } catch (error) {
      console.error("Unhandled error in fetchStripeAdminOverview:", error);
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  }
);

const stripeAdminSlice = createSlice({
  name: "stripeAdmin",
  initialState: {
    platformBalance: {
      available: 0,
      pending: 0,
      currencies: [],
    },
    connectedAccounts: 0,
    recentTransactions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearStripeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStripeAdminOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStripeAdminOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.platformBalance = action.payload.platformBalance;
        state.connectedAccounts = action.payload.connectedAccounts;
        state.recentTransactions = action.payload.recentTransactions;
      })
      .addCase(fetchStripeAdminOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStripeError } = stripeAdminSlice.actions;
export default stripeAdminSlice.reducer;
