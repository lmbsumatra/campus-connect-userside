import { configureStore } from '@reduxjs/toolkit';
import cartReducer from "../features/cart/cartSlice"

const store = configureStore({
  reducer: {
    cart: cartReducer, // Add your reducers here
  },
});

export default store;
