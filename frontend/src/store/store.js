import { configureStore, combineReducers } from "@reduxjs/toolkit";
import studentAuthReducer, { logoutStudent } from "../redux/auth/studentAuthSlice";
import filterReducer from "../redux/filter/filterSlice";
import cartReducer from "../redux/cart/cartSlice";
import userReviewsReducer from "../redux/transactions/userReview";
import loginFormReducer from "../redux/login-form/loginFormSlice";
import signupFormReducer from "../redux/signup-form/signupFormSlice";
import approvedPostByIdSliceReducer from "../redux/post/approvedPostByIdSlice";
import allApprovedPostReducer from "../redux/post/allApprovedPostsSlice";
import availablePostsByUserReducer from "../redux/post/availablePostsByUser";
import listingByIdSliceReducer from "../redux/listing/listingByIdSlice";
import allApprovedListingsReducer from "../redux/listing/allApprovedListingsSlice";
import approvedListingByIdSliceReducer from "../redux/listing/approvedListingByIdSlice";
import allListingsByUserSliceReducer from "../redux/listing/allListingsByUserSlice";
import availableListingsByUserReducer from "../redux/listing/availableListingsByUser";
import itemForSaleByIdSliceReducer from "../redux/item-for-sale/itemForSaleByIdSlice";
import allApprovedItemForSaleReducer from "../redux/item-for-sale/allApprovedItemsForSaleSlice";
import approvedItemForSaleByIdReducer from "../redux/item-for-sale/approvedItemForSaleByIdSlice";
import allItemForSaleByUserSliceReducer from "../redux/item-for-sale/allItemForSaleByUserSlice";
import availableItemsForSaleByUserReducer from "../redux/item-for-sale/availableItemsForSaleByUser";
import alertPopupReducer from "../redux/alert-popup/alertPopupSlice";
import tagReducer from "../redux/tag/tagSlice";
import userReducer from "../redux/user/userSlice";
import allUsersReducer from "../redux/user/allUsersSlice";
import userTransactionsReducer from "../redux/transactions/rentalTransactionsSlice";
import merchantReducer from "../redux/merchant/merchantSlice";
import itemFormReducer from "../redux/item-form/itemFormSlice";
import postFormReducer from "../redux/post-form/postFormSlice";

// Combine all reducers
const appReducer = combineReducers({
  filter: filterReducer,
  cart: cartReducer,
  userReviews: userReviewsReducer,
  studentAuth: studentAuthReducer,
  approvedPostById: approvedPostByIdSliceReducer,
  availablePostsByUser: availablePostsByUserReducer,
  listingById: listingByIdSliceReducer,
  allApprovedListings: allApprovedListingsReducer,
  approvedListingById: approvedListingByIdSliceReducer,
  allListingsByUser: allListingsByUserSliceReducer,
  availableListingsByUser: availableListingsByUserReducer,
  itemForSaleById: itemForSaleByIdSliceReducer,
  allApprovedItemForSale: allApprovedItemForSaleReducer,
  approvedItemForSaleById: approvedItemForSaleByIdReducer,
  allItemForSaleByUser: allItemForSaleByUserSliceReducer,
  availableItemsForSaleByUser: availableItemsForSaleByUserReducer,
  allApprovedPosts: allApprovedPostReducer,
  notification: alertPopupReducer,
  tags: tagReducer,
  loginForm: loginFormReducer,
  signupForm: signupFormReducer,
  user: userReducer,
  allUsers: allUsersReducer,
  merchant: merchantReducer,
  rentalTransactions: userTransactionsReducer,
  itemForm: itemFormReducer,
  postForm: postFormReducer,
});

// Root reducer with reset functionality
const rootReducer = (state, action) => {
  if (action.type === logoutStudent.type) {
    state = undefined; // Reset entire Redux state
    localStorage.clear(); // Clear local storage as well
  }
  return appReducer(state, action);
};

// Configure store
const store = configureStore({
  reducer: rootReducer,
});

export default store;
