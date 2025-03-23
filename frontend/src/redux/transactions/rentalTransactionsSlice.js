import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

export const fetchRentalTransactions = createAsyncThunk(
  "rentalTransactions/fetch",
  async (userId, { rejectWithValue }) => {
    // console.log("Fetching rental transactions for user:", userId);

    if (!userId) {
      return {
        transactions: [],
        stats: {
          totalTransactions: 0,
          rentalTransactions: 0,
          saleTransactions: 0,
          revenue: 0,
          successfulTransactions: 0,
          pendingTransactions: 0,
          cancelledTransactions: 0,
        },
      };
    }

    try {
      const response = await axios.get(
        `${baseApi}/rental-transaction/user/${userId}`
      );
      // console.log("Fetch response:", response.data);

      return response.data;
    } catch (err) {
      console.error("Error fetching rental transactions:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Async thunk to update rental transaction status and data.
 */
export const updateRentalStatus = createAsyncThunk(
  "rentalTransactions/updateStatus",
  async (
    { rentalId, newStatus, userId, transactionType },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${baseApi}/rental-transaction/user/${rentalId}/${newStatus}`,
        { userId, transactionType }
      );

      // console.log("Update response:", response.data);

      if (response.data) {
        return response.data;
      } else {
        throw new Error("Failed to update transaction");
      }
    } catch (err) {
      console.error("Error updating rental transaction:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Async thunk to add review to a rental transaction
 */
export const addReview = createAsyncThunk(
  "rentalTransactions/addReview",
  async ({ rentalId, reviewData, userId }, { rejectWithValue }) => {
    // console.log("Adding review for transaction:", {
    //   rentalId,
    //   reviewData,
    //   userId,
    // });

    try {
      const response = await axios.post(
        `${baseApi}/rental-transaction/review/${rentalId}`,
        { userId, ...reviewData }
      );

      // console.log("Review added:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error adding review:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Async thunk to process payment for a transaction
 */
export const processPayment = createAsyncThunk(
  "rentalTransactions/processPayment",
  async ({ rentalId, paymentMethod, userId }, { rejectWithValue }) => {
    // console.log("Processing payment for transaction:", {
    //   rentalId,
    //   paymentMethod,
    //   userId,
    // });

    try {
      const response = await axios.post(
        `${baseApi}/rental-transaction/payment/${rentalId}`,
        { userId, paymentMethod }
      );

      // console.log("Payment processed:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error processing payment:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

const rentalTransactionsSlice = createSlice({
  name: "rentalTransactions",
  initialState: {
    transactions: [],
    stats: {
      totalTransactions: 0,
      rentalTransactions: 0,
      saleTransactions: 0,
      revenue: 0,
      successfulTransactions: 0,
      pendingTransactions: 0,
      cancelledTransactions: 0,
    },
    loading: false,
    error: null,
    currentTransaction: null,
    paymentProcessing: false,
    paymentError: null,
  },
  reducers: {
    setRentalTransactions: (state, action) => {
      // Handle both the new and old data formats
      if (action.payload.transactions) {
        state.transactions = action.payload.transactions;
      } else if (Array.isArray(action.payload)) {
        state.transactions = action.payload;
      }

      // Handle stats if provided
      if (action.payload.stats) {
        state.stats = action.payload.stats;
      } else if (action.payload.totalTransactions !== undefined) {
        // Handle old format for backward compatibility
        state.stats = {
          ...state.stats,
          totalTransactions: action.payload.totalTransactions || 0,
          revenue: action.payload.revenue || 0,
          successfulTransactions: action.payload.successfulTransactions || 0,
        };
      }
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
    updateTransactionInList: (state, action) => {
      const updatedTransaction = action.payload;
      state.transactions = state.transactions.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction
      );

      if (
        state.currentTransaction &&
        state.currentTransaction.id === updatedTransaction.id
      ) {
        state.currentTransaction = updatedTransaction;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions cases
      .addCase(fetchRentalTransactions.pending, (state) => {
        // console.log("Fetching rental transactions...");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentalTransactions.fulfilled, (state, action) => {
        // console.log(
        //   "Rental transactions fetched successfully:",
        //   action.payload
        // );
        state.loading = false;

        // Handle new data format with stats
        if (action.payload.transactions) {
          state.transactions = action.payload.transactions;
          state.stats = action.payload.stats || state.stats;
        } else {
          // Handle old format for backward compatibility
          state.transactions = action.payload.transactions || [];
          state.stats = {
            ...state.stats,
            totalTransactions: action.payload.totalTransactions || 0,
            revenue: action.payload.revenue || 0,
            successfulTransactions: action.payload.successfulTransactions || 0,
          };
        }
      })
      .addCase(fetchRentalTransactions.rejected, (state, action) => {
        console.error("Failed to fetch rental transactions:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      // Update status cases
      .addCase(updateRentalStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRentalStatus.fulfilled, (state, action) => {
        // console.log("Rental status updated:", action.payload);
        state.loading = false;

        // Update the transaction in the list
        const updatedTransaction = action.payload;
        state.transactions = state.transactions.map((transaction) => {
          if (transaction.id === updatedTransaction.id) {
            // Preserve the tx property if it exists and merge with updated data
            return {
              ...updatedTransaction,
              tx: updatedTransaction.tx || transaction.tx,
            };
          }
          return transaction;
        });

        // Update current transaction if it's the one being modified
        if (
          state.currentTransaction &&
          state.currentTransaction.id === updatedTransaction.id
        ) {
          state.currentTransaction = {
            ...updatedTransaction,
            tx: updatedTransaction.tx || state.currentTransaction.tx,
          };
        }
      })
      .addCase(updateRentalStatus.rejected, (state, action) => {
        console.error("Failed to update rental transaction:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      // Add review cases
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        // console.log("Review added successfully:", action.payload);
        state.loading = false;

        // Update the transaction with the new review
        const updatedTransaction = action.payload;
        state.transactions = state.transactions.map((transaction) => {
          if (transaction.id === updatedTransaction.id) {
            return {
              ...transaction,
              ...updatedTransaction,
              tx: {
                ...(transaction.tx || {}),
                ...(updatedTransaction.tx || {}),
                has_review_rating: true,
              },
            };
          }
          return transaction;
        });

        // Update current transaction if applicable
        if (
          state.currentTransaction &&
          state.currentTransaction.id === updatedTransaction.id
        ) {
          state.currentTransaction = {
            ...state.currentTransaction,
            ...updatedTransaction,
            tx: {
              ...(state.currentTransaction.tx || {}),
              ...(updatedTransaction.tx || {}),
              has_review_rating: true,
            },
          };
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        console.error("Failed to add review:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      // Process payment cases
      .addCase(processPayment.pending, (state) => {
        state.paymentProcessing = true;
        state.paymentError = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        // console.log("Payment processed successfully:", action.payload);
        state.paymentProcessing = false;

        // Update the transaction with the new payment status
        const updatedTransaction = action.payload;
        state.transactions = state.transactions.map((transaction) => {
          if (transaction.id === updatedTransaction.id) {
            return {
              ...transaction,
              ...updatedTransaction,
              paymentStatus: updatedTransaction.paymentStatus || "Completed",
              tx: {
                ...(transaction.tx || {}),
                ...(updatedTransaction.tx || {}),
                payment_status:
                  updatedTransaction.tx?.payment_status || "Completed",
              },
            };
          }
          return transaction;
        });

        // Update current transaction if applicable
        if (
          state.currentTransaction &&
          state.currentTransaction.id === updatedTransaction.id
        ) {
          state.currentTransaction = {
            ...state.currentTransaction,
            ...updatedTransaction,
            paymentStatus: updatedTransaction.paymentStatus || "Completed",
            tx: {
              ...(state.currentTransaction.tx || {}),
              ...(updatedTransaction.tx || {}),
              payment_status:
                updatedTransaction.tx?.payment_status || "Completed",
            },
          };
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        console.error("Failed to process payment:", action.payload);
        state.paymentProcessing = false;
        state.paymentError = action.payload;
      });
  },
});

export const {
  setRentalTransactions,
  setCurrentTransaction,
  clearError,
  updateTransactionInList,
} = rentalTransactionsSlice.actions;

export default rentalTransactionsSlice.reducer;
