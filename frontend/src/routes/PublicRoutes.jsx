import React from 'react';
import { Route } from 'react-router-dom';

import Home from '../pages/public/Home';
import LoginSignUp from '../pages/public/login-signup/LoginSignup';
import Cart from '../pages/private/users/cart/Cart';
import Rent from '../pages/public/Rent';
import Lend from '../pages/public/Lend';
import Shop from '../pages/public/Shop';
import VerifyEmail from '../components/emails/VerifyEmail.jsx';

const PublicRoutes = [
  <Route key="verify-email" path="/verify-email/:token" element={<VerifyEmail />} />,
  <Route key="cart" path="/cart" element={<Cart />} />,
  <Route key="login-signup" path="/login-signup" element={<LoginSignUp />} />,
  <Route key="home" path="/*" element={<Home />} />,
  <Route key="home-alt" path="/home" element={<Home />} />,
  <Route key="rent" path="/rent" element={<Rent />} />,
  <Route key="lend" path="/lend" element={<Lend />} />,
  <Route key="shop" path="/shop" element={<Shop />} />
];

export default PublicRoutes;