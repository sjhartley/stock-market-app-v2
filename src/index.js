import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App";
import Watchlist from "./routes/watchlist";
import Charts from "./routes/charts";
import Radio from "./routes/radio";
import Tv from "./routes/tv";
import Data from "./routes/data";
import NotLoggedIn from "./routes/NotLoggedIn";
import { AuthProvider, AuthContext } from "./routes/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Inline ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  // Wait until auth state is resolved
  if (loading) return <div>Loading...</div>;

  // Redirect to home if no token
  if (!token) return <Navigate to="/NotLoggedIn" replace />;

  // Render protected component
  return children;
};

root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<App />} />
        <Route path="NotLoggedIn" element={<NotLoggedIn />} />
        {/* Protected Routes */}
        <Route
          path="watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="charts"
          element={
            <ProtectedRoute>
              <Charts widgetMode={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="radio"
          element={
            <ProtectedRoute>
              <Radio />
            </ProtectedRoute>
          }
        />
        <Route
          path="tv"
          element={
            <ProtectedRoute>
              <Tv />
            </ProtectedRoute>
          }
        />
        <Route
          path="data"
          element={
            <ProtectedRoute>
              <Data />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
);
