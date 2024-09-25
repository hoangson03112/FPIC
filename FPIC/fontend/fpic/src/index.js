import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Register from "./components/Register";
import ManageAccount from "./components/ManageAccount";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/home" element={<App />}></Route>
        <Route path="/home/page/:currentPage" element={<App />} />
        <Route path="/auth/login" element={<Login />}></Route>
        <Route path="/auth/signup" element={<Register />}></Route>
        <Route path="/my-account" element={<Profile />}></Route>
        <Route
          path="/admin/manager-account"
          element={<ManageAccount />}
        ></Route>
        <Route></Route>
        <Route></Route>
        <Route></Route>
        <Route></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
