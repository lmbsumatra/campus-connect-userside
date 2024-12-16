// src/features/cart/cartSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";

const initialState = {
  items: [],
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i.name === item.name);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      state.totalPrice += item.price;
    },
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
});

// Define the base selector to access the cart state
const selectCart = (state) => state.cart;

// Selector to get the items from the cart
export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart.items
);

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
