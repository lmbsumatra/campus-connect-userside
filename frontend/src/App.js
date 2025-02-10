import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import store from "./store/store";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminRoutes from "./routes/AdminRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import StudentProtectedRoutes from "./routes/StudentProtectedRoutes";

import "./App.css";
import "./styles/buttons.css";
import "./styles/text.css";
import "./styles/icons.css";
import "./styles/cards.css";
import "./styles/containers.css";
import "./styles/status.css";
import "./trials/Trial.css";
import "./styles/loadingOverlayStyles.css";
import {
  REACT_APP_API_URL,
  REACT_APP_GOOGLE_CLIENT_ID,
} from "./utils/consonants.js";
import PageNotFound from "./pages/public/PageNotFound.js";

function App() {
  return (
    <SocketProvider>
      <Provider store={store}>
        <AuthProvider>
          <ChatProvider>
            <BrowserRouter>
              <GoogleOAuthProvider clientId={REACT_APP_GOOGLE_CLIENT_ID}>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    {PublicRoutes}
                    {StudentProtectedRoutes}
                  </Route>
                  {/* Admin Routes */}
                  <Route element={<AdminLayout />}>{AdminRoutes}</Route>
                  {/* Page not found */}
                  <Route path="/*" element={<PageNotFound />} />,
                </Routes>
              </GoogleOAuthProvider>
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </Provider>
    </SocketProvider>
  );
}
export const baseApi = REACT_APP_API_URL || "http://localhost:3001";
export default App;
