import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios";


const BASE_URL = "http://localhost:3001/api/cart";

const initialState = {
  items: [],
  totalPrice: 0,
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    const { studentUser } = getState().studentAuth; 

    if (!studentUser?.token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await axios.get(`${BASE_URL}/get`, {
        headers: {
          Authorization: `Bearer ${studentUser.token}`, 
        },
      });

      return response.data; // Return fetched cart data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch cart.");
    }
  }
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async (item, { getState, rejectWithValue }) => {
    const { studentUser } = getState().studentAuth; 

    if (!studentUser?.token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await axios.post(`${BASE_URL}/add`, item, {
        headers: {
          Authorization: `Bearer ${studentUser.token}`, 
        },
      });

      console.log(response.data);
      return response.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to add item to cart."
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId, { getState, rejectWithValue }) => {
    const { studentUser } = getState().studentAuth;

    if (!studentUser?.token) {
      return rejectWithValue("No token found");
    }

    try {
      const response = await axios.delete(`${BASE_URL}/remove/${itemId}`, {
        headers: {
          Authorization: `Bearer ${studentUser.token}`,
        },
      });
      return itemId; 
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to remove item.");
    }
  }
);

// Cart Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.totalPrice = action.payload.totalPrice || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cart.";
      });

    builder
      .addCase(addCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null; 
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = action.payload;
        const existingItem = state.items.find((i) => i.id === newItem.id);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push({ ...newItem, quantity: 1 });
        }

        state.totalPrice = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        state.successMessage = "Item added to cart successfully!"; 
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add item to cart.";
        state.successMessage = null; 
      });

    builder
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.successMessage = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const itemId = action.payload;
        const itemToRemove = state.items.find((i) => i.id === itemId);

        if (itemToRemove) {
          state.totalPrice -= itemToRemove.price * itemToRemove.quantity;
          state.items = state.items.filter((item) => item.id !== itemId);
        }

        state.loading = false;
        state.successMessage = "Item removed successfully!";
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove item.";
        state.successMessage = null;
      });
  },
});


// Selectors
const selectCart = (state) => state.cart;

export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart.items
);
export const selectTotalPrice = createSelector(
  [selectCart],
  (cart) => cart.totalPrice
);
export const selectCartLoading = createSelector(
  [selectCart],
  (cart) => cart.loading
);
export const selectCartError = createSelector(
  [selectCart],
  (cart) => cart.error
);
export const selectCartSuccessMessage = createSelector(
  [selectCart],
  (cart) => cart.successMessage
);

// Export actions
export const { clearCart, setSuccessMessage, clearSuccessMessage } =
  cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
