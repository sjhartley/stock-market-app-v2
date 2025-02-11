import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App';
import Data from "./routes/data";
import Watchlist from "./routes/watchlist";
import Charts from "./routes/charts";
import NewLayout from "./new_home_page";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="data" element={<Data />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="charts" element={<Charts />} />
            <Route path="new_layout" element={<NewLayout /> } />
        </Routes>
    </BrowserRouter>
);
