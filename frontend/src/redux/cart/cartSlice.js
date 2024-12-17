import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios"; // Use axios for API requests (install via npm if not already installed)

// Backend API endpoints
const BASE_URL = "http://localhost:3001/api/cart";

// Initial state
const initialState = {
  items: [],
  totalPrice: 0,
  loading: false,
  error: null,
};

// Asynchronous Thunks for API calls

// Fetch cart items from backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/get`);
      // console.log(response.data)
      return response.data; // Return fetched cart data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Post a new cart item to the backend
export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async (item, thunkAPI) => {
    try {
      console.log(item);
      const response = await axios.post(`${BASE_URL}/add`, item);
      console.log(response);
      return response.data; // Return added cart item
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Cart Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    removeItem: (state, action) => {
      const itemId = action.payload;
      const itemToRemove = state.items.find((i) => i.name === itemId);
      if (itemToRemove) {
        state.totalPrice -= itemToRemove.price * itemToRemove.quantity;
        state.items = state.items.filter((i) => i.name !== itemId);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchCart lifecycle
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

    // Handle addCartItem lifecycle
    builder
      // When the action is fulfilled (successful addition of item)
      .addCase(addCartItem.fulfilled, (state, action) => {
        const newItem = action.payload;

        // 1. Check if the item already exists in the cart
        const existingItem = state.items.find((i) => i.id === newItem.id);

        // 2. If item exists, increment its quantity; otherwise, add the new item
        if (existingItem) {
          // Update the quantity of the existing item
          existingItem.quantity += 1;
        } else {
          // Add new item with quantity of 1
          state.items.push({ ...newItem, quantity: 1 });
        }

        // 3. Update the total price by adding the price of the new or updated item
        state.totalPrice += newItem.price;
      })

      // When the action is rejected (error occurred while adding item)
      .addCase(addCartItem.rejected, (state, action) => {
        // Store the error message in the state
        state.error = action.payload || "Failed to add item to cart.";
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

// Export actions
export const { addItem, removeItem, clearCart } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
