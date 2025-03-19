import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios";

const BASE_URL = "http://localhost:3001/api/cart";

const initialState = {
  cartItems: [],
  totalPrice: 0,
  loadingCart: false,
  errorCartMessage: null,
  successCartMessage: null,
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
  async (item, { getState, dispatch, rejectWithValue }) => {
    const { studentUser } = getState().studentAuth;

    if (!studentUser?.token) {
      return rejectWithValue("No token found");
    }

    const { cartItems } = getState().cart; // Get the current cartItems from state

    // Check if the item is already in the cart
    const existingItem = cartItems.find(
      (cartItem) =>
        cartItem.itemId === item.itemId && cartItem.userId === item.userId
    );

    // console.log(studentUser.token)

    if (existingItem !== undefined) {
      // If item already exists in cart, return 'existing' status
      return { status: "existing", item: existingItem };
    } else {
      try {
        // If item doesn't exist, proceed to add it to the cart
        const response = await axios.post(`${BASE_URL}/add`, item, {
          headers: {
            Authorization: `Bearer ${studentUser.token}`,
          },
        });

        return { status: "new", item: response.data }; // Return a new item
      } catch (error) {
        console.error("Error while adding item to cart:", error);
        return rejectWithValue(
          error.response?.data || error.message || "Failed to add item to cart."
        );
      }
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
      return response.data;
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
      state.cartItems = [];
      state.totalPrice = 0;
    },
    setSuccessMessage: (state, action) => {
      state.successCartMessage = action.payload;
    },
    clearSuccessMessage: (state) => {
      state.successCartMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loadingCart = true;
        state.errorCartMessage = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loadingCart = false;
        state.cartItems = action.payload || []; // Ensure cartItems is updated correctly
        state.totalPrice = action.payload.totalPrice || 0; // Ensure totalPrice is correctly set
      })

      .addCase(fetchCart.rejected, (state, action) => {
        state.loadingCart = false;
        state.errorCartMessage = action.payload || "Failed to fetch cart.";
      });

    builder
      .addCase(addCartItem.pending, (state) => {
        state.loadingCart = true;
        state.errorCartMessage = null;
        state.warningCartMessage = null;
        state.successCartMessage = null;
        // Do not reset the success message here.
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.loadingCart = false;
        const { status, item } = action.payload;

        if (status === "existing") {
          // Don't modify the cart if the item is already there
          state.warningCartMessage = "Item already added to cart!";
        } else if (status === "new") {
          // Add the item to the cart if it doesn't already exist
          state.cartItems.push({ ...item });
          state.successCartMessage = "Item added to cart successfully!";
        }

        // Recalculate the total price by summing all cartItems in the cart
        state.totalPrice = state.cartItems.reduce(
          (total, item) => total + item.price,
          0
        );
      })

      .addCase(addCartItem.rejected, (state, action) => {
        state.loadingCart = false;
        state.errorCartMessage = action.payload;
        // Clear the success message only if action fails
        state.successCartMessage = null;
      });

    builder
      .addCase(removeCartItem.pending, (state) => {
        state.loadingCart = true;
        // Do not reset the success message here.
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const { itemId } = action.payload;

        const itemToRemove = state.cartItems.find(
          (item) => item.itemId === itemId
        );

        if (itemToRemove) {
          // Deduct the price of the item to be removed from the total price
          state.totalPrice -= itemToRemove.price * itemToRemove.quantity;

          // Remove the item from the cart
          state.cartItems = state.cartItems.filter(
            (item) => item.itemId !== itemId // Ensure you use correct property
          );

          // Recalculate the total price
          state.totalPrice = state.cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );

          // Set success message
          state.successCartMessage = "Item removed successfully!";
        } else {
          console.error("Item not found in cart:", itemId);
        }

        state.loadingCart = false;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loadingCart = false;
        state.errorCartMessage = action.payload || "Failed to remove item.";
        // Clear the success message only if action fails
        state.successCartMessage = null;
      });
  },
});

// Selectors
const selectCart = (state) => state.cart;

export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart.cartItems // Use cartItems, not items
);
export const selectTotalPrice = createSelector(
  [selectCart],
  (cart) => cart.totalPrice
);
export const selectCartLoading = createSelector(
  [selectCart],
  (cart) => cart.loadingCart
);
export const selectCartError = createSelector(
  [selectCart],
  (cart) => cart.errorCartMessage
);
export const selectCartSuccessMessage = createSelector(
  [selectCart],
  (cart) => cart.successCartMessage
);

// Export actions
export const { clearCart, setSuccessMessage, clearSuccessMessage } =
  cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
