import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { REACT_APP_URL_SERVER, REACT_APP_URL_BE } from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      return;
    } else {
      setEmailError("");
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    } else {
      setPasswordError("");
    }

    try {
      const response = await axios.post(`${REACT_APP_URL_BE}/login`, {
        email,
        password,
      });

      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      } else if (response.data.status !== "success") {
        alert(response.data.c);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setEmailError("Invalid email or password.");
      } else {
        setEmailError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        backgroundImage: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-sm-5">
                <h1 className="text-center mb-4 fw-light">Đăng nhập</h1>
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-4">
                    <input
                      type="email"
                      className={`form-control ${
                        emailError ? "is-invalid" : ""
                      }`}
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label
                      htmlFor="email"
                      className="d-flex align-items-center gap-2"
                    >
                      <FaEnvelope className="text-muted" />
                      <span>Email</span>
                    </label>
                    {emailError && (
                      <div className="invalid-feedback">{emailError}</div>
                    )}
                  </div>

                  <div className="form-floating mb-4">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className={`form-control ${
                        passwordError ? "is-invalid" : ""
                      }`}
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label
                      htmlFor="password"
                      className="d-flex align-items-center gap-2"
                    >
                      <FaLock className="text-muted" />
                      <span>Mật khẩu</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none me-3"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{ zIndex: 5 }}
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {passwordError && (
                      <div className="invalid-feedback">{passwordError}</div>
                    )}
                  </div>

                  <div className="d-grid gap-2  ">
                    <button
                      type="submit"
                      className="w-75 mt-4 p-2 btn btn-outline-primary btn-lg"
                    >
                      Đăng nhập
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
