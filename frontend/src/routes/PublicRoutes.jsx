import React from "react";
import { Route } from "react-router-dom";

import Home from "../pages/public/Home";
import SearchResults from "../pages/public/SearchResults";
import LoginSignUp from "../pages/public/login-signup/LoginSignup";
import Cart from "../pages/private/users/cart/Cart";
import Rent from "../pages/public/Rent";
import Lend from "../pages/public/Lend";
import Shop from "../pages/public/Shop";
import VerifyEmail from "../components/emails/VerifyEmail.jsx";
import PostDetail from "../pages/public/post/PostDetail.js";
import ListingDetail from "../pages/public/listing/listing-detail/ListingDetail.js";
import ItemForSaleDetail from "../pages/public/item-for-sale/ItemForSaleDetail.js";
import PrivacyPolicy from "../pages/public/PrivacyPolicy.js";
import TermsAndCondition from "../pages/public/TermsAndCondition.js";

const PublicRoutes = [
  <Route
    key="verify-email"
    path="/verify-email/:token"
    element={<VerifyEmail />}
  />,
  <Route key="cart" path="/cart" element={<Cart />} />,
  <Route key="login-signup" path="/login-signup" element={<LoginSignUp />} />,
  <Route key="home" path="/" element={<Home />} />,
  <Route key="home-alt-1" path="/discover" element={<Home />} />,
  <Route key="home-alt-2" path="/home" element={<Home />} />,
  <Route key="rent" path="/rent" element={<Rent />} />,
  <Route key="lend" path="/lend" element={<Lend />} />,
  <Route key="shop" path="/shop" element={<Shop />} />,
  <Route path="/cart" element={<Cart />} />,
  <Route path="/post/:id" element={<PostDetail />} />,
  <Route path="/rent/:id" element={<ListingDetail />} />,
  <Route path="/shop/:id" element={<ItemForSaleDetail />} />,
  <Route path="/results" element={<SearchResults />} />,
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />,
  <Route path="/terms-and-condition" element={<TermsAndCondition />} />,
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />,
  <Route path="/terms-and-condition" element={<TermsAndCondition />} />,
];

export default PublicRoutes;
