import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Accessory from "./Accessory";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Register from "./components/Register";
import ManageAccount from "./components/ManageAccount";
import Layout from "./Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import AdminHomePage from "./components/AdminHomePage";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<AdminHomePage />}></Route>
        </Route>{" "}
        <Route element={<Layout />}>
          <Route path="/page/:currentPage" element={<Accessory />} />
        </Route>{" "}
        <Route path="/auth/login" element={<Login />}></Route>
        <Route path="/auth/signup" element={<Register />}></Route>
        <Route element={<Layout />}>
          <Route path="/my-account" element={<Profile />}></Route>
        </Route>{" "}
        <Route element={<Layout />}>
          <Route
            path="/admin/manager-account"
            element={<ManageAccount />}
          ></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
