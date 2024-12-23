import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../redux/cart/cartSlice";
import studentAuthReducer from "../redux/auth/studentAuthSlice";
import approvedPostByIdSliceReducer from "../redux/post/approvedPostByIdSlice";
import approvedListingByIdSliceReducer from "../redux/listing/approvedListingByIdSlice";
import approvedItemForSaleByIdReducer from "../redux/item-for-sale/approvedItemForSaleByIdSlice";
import allApprovedPostReducer from "../redux/post/allApprovedPostsSlice";
import alertPopupReducer from "../redux/alert-popup/alertPopupSlice";
import tagReducer from "../redux/tag/tagSlice";
import loginFormReducer from "../redux/login-form/loginFormSlice";
import signupFormReducer from "../redux/signup-form/signupFormSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    studentAuth: studentAuthReducer,
    approvedPostById: approvedPostByIdSliceReducer,
    approvedListingById: approvedListingByIdSliceReducer,
    approvedItemForSaleById: approvedItemForSaleByIdReducer,
    //
    allApprovedPosts: allApprovedPostReducer,
    //
    notification: alertPopupReducer,
    //
    tags: tagReducer,
    //
    loginForm: loginFormReducer,
    signupForm: signupFormReducer,
  },
});

export default store;
