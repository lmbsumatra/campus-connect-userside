// rentalTransactionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchRentalTransactions = createAsyncThunk(
  'rentalTransactions/fetch',
  async (userId, { rejectWithValue }) => {
    console.log('Fetching rental transactions for user:', userId);

    if (!userId) {
      return [];
    }
    try {
      const response = await axios.get(`http://localhost:3001/rental-transaction/user/${userId}`);
      console.log('Fetch response:', response.data);

      return Array.isArray(response.data) ? response.data : [];
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
      // API call to update status
      const response = await axios.post(
        `http://localhost:3001/rental-transaction/user/${rentalId}/${newStatus}`,
        { userId }
      );

      console.log('Update response:', response.data);

      if (response.data) {
        // Extract updated transaction from response
        const updatedTransaction = response.data;

        // Get current state and update only the modified transaction
        const updatedTransactions = getState().rentalTransactions.transactions.map((transaction) =>
          transaction.id === rentalId ? updatedTransaction : transaction
        );

        // Dispatch action to update Redux state
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

// Redux slice for rental transactions
const rentalTransactionsSlice = createSlice({
  name: 'rentalTransactions',
  initialState: {
    transactions: [],
    loading: false,
    error: null
  },
  reducers: {
    setRentalTransactions: (state, action) => {
      state.transactions = action.payload; // Update the transaction list
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentalTransactions.pending, (state) => {
        console.log('Fetching rental transactions...'); // Pending state log
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentalTransactions.fulfilled, (state, action) => {
        console.log('Rental transactions fetched successfully:', action.payload);
        state.loading = false;
        state.transactions = action.payload;
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
