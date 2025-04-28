import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Watchlist from "./routes/watchlist";
import Charts from "./routes/charts";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="watchlist" element={<Watchlist />} />
      <Route path="charts" element={<Charts />} />
    </Routes>
  </BrowserRouter>
);
