import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../redux/cart/cartSlice";
import studentAuthReducer from "../redux/auth/studentAuthSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer, 
    studentAuth: studentAuthReducer,
  },
});

export default store;
