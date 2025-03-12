import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchRentalTransactions = createAsyncThunk(
  'rentalTransactions/fetch',
  async (userId, { rejectWithValue }) => {
    console.log('Fetching rental transactions for user:', userId);

    if (!userId) {
      return { transactions: [], totalTransactions: 0, revenue: 0, successfulTransactions: 0 };
    }
    try {
      const response = await axios.get(`http://localhost:3001/rental-transaction/user/${userId}`);
      console.log('Fetch response:', response.data);

      const { rentals, totalTransactions, revenue, successfulTransactions } = response.data;
      return { transactions: rentals, totalTransactions, revenue, successfulTransactions };
    } catch (err) {
      console.error('Error fetching rental transactions:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Async thunk to update rental transaction status and data.
 */
export const updateRentalStatus = createAsyncThunk(
  'rentalTransactions/updateStatus',
  async ({ rentalId, newStatus, userId }, { rejectWithValue, dispatch, getState }) => {
    console.log('Updating rental status:', { rentalId, newStatus, userId });

    try {
      const response = await axios.post(
        `http://localhost:3001/rental-transaction/user/${rentalId}/${newStatus}`,
        { userId }
      );

      console.log('Update response:', response.data);

      if (response.data) {
        const updatedTransaction = response.data;
        const updatedTransactions = getState().rentalTransactions.transactions.map((transaction) =>
          transaction.id === rentalId ? updatedTransaction : transaction
        );

        dispatch(setRentalTransactions(updatedTransactions));

        return updatedTransaction;
      } else {
        throw new Error('Failed to update transaction');
      }
    } catch (err) {
      console.error('Error updating rental transaction:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

const rentalTransactionsSlice = createSlice({
  name: 'rentalTransactions',
  initialState: {
    transactions: [],
    totalTransactions: 0,
    revenue: 0,
    successfulTransactions: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setRentalTransactions: (state, action) => {
      state.transactions = action.payload.transactions;
      state.totalTransactions = action.payload.totalTransactions;
      state.revenue = action.payload.revenue;
      state.successfulTransactions = action.payload.successfulTransactions;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentalTransactions.pending, (state) => {
        console.log('Fetching rental transactions...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentalTransactions.fulfilled, (state, action) => {
        console.log('Rental transactions fetched successfully:', action.payload);
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.totalTransactions = action.payload.totalTransactions;
        state.revenue = action.payload.revenue;
        state.successfulTransactions = action.payload.successfulTransactions;
      })
      .addCase(fetchRentalTransactions.rejected, (state, action) => {
        console.error('Failed to fetch rental transactions:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRentalStatus.fulfilled, (state, action) => {
        console.log('Rental status updated:', action.payload);
        state.transactions = state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        );
      })
      .addCase(updateRentalStatus.rejected, (state, action) => {
        console.error('Failed to update rental transaction:', action.payload);
        state.error = action.payload;
      });
  }
});

export const { setRentalTransactions } = rentalTransactionsSlice.actions;
export default rentalTransactionsSlice.reducer;