import { configureStore } from "@reduxjs/toolkit";

// ** Cart-related Reducers **
import cartReducer from "../redux/cart/cartSlice";

// ** Authentication-related Reducers **
import studentAuthReducer from "../redux/auth/studentAuthSlice";
import loginFormReducer from "../redux/login-form/loginFormSlice";
import signupFormReducer from "../redux/signup-form/signupFormSlice";

// ** Post-related Reducers **
import approvedPostByIdSliceReducer from "../redux/post/approvedPostByIdSlice";
import allApprovedPostReducer from "../redux/post/allApprovedPostsSlice";

// ** Listing-related Reducers **
import listingByIdSliceReducer from "../redux/listing/listingByIdSlice";
import allApprovedListingsReducer from "../redux/listing/allApprovedListingsSlice";
import approvedListingByIdSliceReducer from "../redux/listing/approvedListingByIdSlice";
import allListingsByUserSliceReducer from "../redux/listing/allListingsByUserSlice";

// ** Item-for-Sale-related Reducers **
import allApprovedItemForSaleReducer from "../redux/item-for-sale/allApprovedItemsForSaleSlice";
import approvedItemForSaleByIdReducer from "../redux/item-for-sale/approvedItemForSaleByIdSlice";
import allItemForSaleByUserSliceReducer from "../redux/item-for-sale/allItemForSaleByUserSlice";

// ** Alert and Tag-related Reducers **
import alertPopupReducer from "../redux/alert-popup/alertPopupSlice";
import tagReducer from "../redux/tag/tagSlice";

// ** User-related Reducers **
import userReducer from "../redux/user/userSlice";

// ** Form-related Reducers **
import itemFormReducer from "../redux/item-form/itemFormSlice";
import postFormReducer from "../redux/post-form/postFormSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    studentAuth: studentAuthReducer,
    approvedPostById: approvedPostByIdSliceReducer,
    //
    listingById: listingByIdSliceReducer,
    allApprovedListings: allApprovedListingsReducer,
    approvedListingById: approvedListingByIdSliceReducer,
    allListingsByUser: allListingsByUserSliceReducer,
    //
    allApprovedItemForSale: allApprovedItemForSaleReducer,
    approvedItemForSaleById: approvedItemForSaleByIdReducer,
    allItemForSaleByUser: allItemForSaleByUserSliceReducer,
    //
    allApprovedPosts: allApprovedPostReducer,
    //
    notification: alertPopupReducer,
    //
    tags: tagReducer,
    //
    loginForm: loginFormReducer,
    signupForm: signupFormReducer,
    user: userReducer,
    //
    itemForm: itemFormReducer,
    postForm: postFormReducer,
  },
});

export default store;
