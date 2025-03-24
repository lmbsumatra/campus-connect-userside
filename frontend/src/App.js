import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import store from "./store/store.js";
import { AuthProvider } from "./context/AuthContext.js";
import { SocketProvider } from "./context/SocketContext.js";
import { ChatProvider } from "./context/ChatContext.js";
import { SystemConfigProvider } from "./context/SystemConfigProvider.js"; // Import SystemConfigProvider

import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import PublicRoutes from "./routes/PublicRoutes.jsx";
import StudentProtectedRoutes from "./routes/StudentProtectedRoutes.jsx";

import "./App.css";
import "./styles/buttons.css";
import "./styles/text.css";
import "./styles/icons.css";
import "./styles/cards.css";
import "./styles/containers.css";
import "./styles/status.css";
import "./trials/Trial.css";
import "./styles/loadingOverlayStyles.css";
import "./styles/indication.css";

import {
  REACT_APP_API_URL,
  REACT_APP_GOOGLE_CLIENT_ID,
  baseApi,
  baseUrl
} from "./utils/consonants.js";

import PageNotFound from "./pages/public/PageNotFound.js";

function App() {
  return (
    <SocketProvider>
      <Provider store={store}>
        <AuthProvider>
          <ChatProvider>
            <SystemConfigProvider>
              {" "}
              {/* Wrap the app with SystemConfigProvider */}
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
                    <Route path="/*" element={<PageNotFound />} />
                  </Routes>
                </GoogleOAuthProvider>
              </BrowserRouter>
            </SystemConfigProvider>
          </ChatProvider>
        </AuthProvider>
      </Provider>
    </SocketProvider>
  );
}

export default App;
