import { configureStore } from "@reduxjs/toolkit";

// fiter
import filterReducer from "../redux/filter/filterSlice";

// ** Cart-related Reducers **
import cartReducer from "../redux/cart/cartSlice";
import userReviewsReducer from "../redux/transactions/userReview";

// ** Authentication-related Reducers **
import studentAuthReducer from "../redux/auth/studentAuthSlice";
import loginFormReducer from "../redux/login-form/loginFormSlice";
import signupFormReducer from "../redux/signup-form/signupFormSlice";

// ** Post-related Reducers **
import approvedPostByIdSliceReducer from "../redux/post/approvedPostByIdSlice";
import allApprovedPostReducer from "../redux/post/allApprovedPostsSlice";
import availablePostsByUserReducer from "../redux/post/availablePostsByUser";

// ** Listing-related Reducers **
import listingByIdSliceReducer from "../redux/listing/listingByIdSlice";
import allApprovedListingsReducer from "../redux/listing/allApprovedListingsSlice";
import approvedListingByIdSliceReducer from "../redux/listing/approvedListingByIdSlice";
import allListingsByUserSliceReducer from "../redux/listing/allListingsByUserSlice";
import availableListingsByUserReducer from "../redux/listing/availableListingsByUser";

// ** Item-for-Sale-related Reducers **
import itemForSaleByIdSliceReducer from "../redux/item-for-sale/itemForSaleByIdSlice";
import allApprovedItemForSaleReducer from "../redux/item-for-sale/allApprovedItemsForSaleSlice";
import approvedItemForSaleByIdReducer from "../redux/item-for-sale/approvedItemForSaleByIdSlice";
import allItemForSaleByUserSliceReducer from "../redux/item-for-sale/allItemForSaleByUserSlice";
import availableItemsForSaleByUserReducer from "../redux/item-for-sale/availableItemsForSaleByUser";

// ** Alert and Tag-related Reducers **
import alertPopupReducer from "../redux/alert-popup/alertPopupSlice";
import tagReducer from "../redux/tag/tagSlice";

// ** User-related Reducers **
import userReducer from "../redux/user/userSlice";
import allUsersReducer from "../redux/user/allUsersSlice";

// ** User transactions **
import userTransactionsReducer from "../redux/transactions/rentalTransactionsSlice";

// ** Merchant-related Reducers **
import merchantReducer from "../redux/merchant/merchantSlice";

// ** Form-related Reducers **
import itemFormReducer from "../redux/item-form/itemFormSlice";
import postFormReducer from "../redux/post-form/postFormSlice";

const store = configureStore({
  reducer: {
    filter: filterReducer,
    cart: cartReducer,
    userReviews: userReviewsReducer,
    studentAuth: studentAuthReducer,
    approvedPostById: approvedPostByIdSliceReducer,
    availablePostsByUser: availablePostsByUserReducer,
    //
    listingById: listingByIdSliceReducer,
    allApprovedListings: allApprovedListingsReducer,
    approvedListingById: approvedListingByIdSliceReducer,
    allListingsByUser: allListingsByUserSliceReducer,
    availableListingsByUser: availableListingsByUserReducer,
    //
    itemForSaleById: itemForSaleByIdSliceReducer,
    allApprovedItemForSale: allApprovedItemForSaleReducer,
    approvedItemForSaleById: approvedItemForSaleByIdReducer,
    allItemForSaleByUser: allItemForSaleByUserSliceReducer,
    availableItemsForSaleByUser: availableItemsForSaleByUserReducer,
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
    allUsers: allUsersReducer,
    merchant: merchantReducer,
    rentalTransactions: userTransactionsReducer,
    //
    itemForm: itemFormReducer,
    postForm: postFormReducer,
  },
});

export default store;
