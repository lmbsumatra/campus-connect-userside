// rentalTransactionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching rental transactions
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

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (err) {
      console.error('Error fetching rental transactions:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to update rental status
export const updateRentalStatus = createAsyncThunk(
  'rentalTransactions/updateStatus',
  async ({ rentalId, newStatus, userId }, { rejectWithValue, dispatch, getState }) => {
    console.log('Updating rental status:', { rentalId, newStatus, userId });

    try {
      // Make API call to update status
      const response = await axios.post(
        `http://localhost:3001/rental-transaction/user/${rentalId}/${newStatus}`,
        { userId }
      );

      console.log('Update status response:', response.data);

      if (response.data) {
        // Define a variable to hold the final status
        let finalStatus = newStatus;  // Default is the newStatus provided

        // Update the transaction based on the new status
        const updatedTransactions = getState().rentalTransactions.transactions.map((transaction) => {
          if (transaction.id === rentalId) {
            // Update the transaction with the correct finalStatus
            return { ...transaction, status: finalStatus };
          }
          return transaction; // Keep other transactions as is
        });

        // Dispatch the action to update the rental transaction list
        dispatch(updateRentalTransactionList(updatedTransactions));

        // Return rentalId and the final status
        return { rentalId, newStatus: finalStatus };
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating rental status:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to update the list of rental transactions
export const updateRentalTransactionList = createAsyncThunk(
  'rentalTransactions/updateList',
  async (updatedTransactions, { rejectWithValue }) => {
    console.log('Updating rental transaction list:', updatedTransactions);
    try {
      return updatedTransactions; // Return the updated list
    } catch (err) {
      console.error('Error updating transaction list:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Rental transactions slice
const rentalTransactionsSlice = createSlice({
  name: 'rentalTransactions',
  initialState: {
    transactions: [],
    loading: false,
    error: null
  },
  reducers: {},
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
        // The update will be handled by updateRentalTransactionList automatically
      })
      .addCase(updateRentalTransactionList.fulfilled, (state, action) => {
        console.log('Updated transaction list:', action.payload);
        state.transactions = action.payload; // Update the transaction list
      });
  }
});

export default rentalTransactionsSlice.reducer;
