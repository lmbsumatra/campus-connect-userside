import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../redux/cart/cartSlice";
import studentAuthReducer from "../redux/auth/studentAuthSlice";
import approvedPostByIdSliceReducer from "../redux/post/approvedPostByIdSlice";
import allApprovedPostReducer from "../redux/post/allApprovedPostsSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    studentAuth: studentAuthReducer,
    approvedPostById: approvedPostByIdSliceReducer,
    allApprovedPosts: allApprovedPostReducer,
  },
});

export default store;
