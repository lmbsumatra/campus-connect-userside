import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../redux/cart/cartSlice";
import studentAuthReducer from "../redux/auth/studentAuthSlice";
import postReducer from "../redux/post/postSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    studentAuth: studentAuthReducer,
    post: postReducer,
  },
});

export default store;
