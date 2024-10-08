import React, { useState } from "react";
import "./Login.css";
import styled from "styled-components";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 30px;
  width: 450px;
  border-radius: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  max-height: 450px;
`;

const Background = styled.div`
  background-image: url("D:\Git\FPIC\FPIC\fontend\fpic\public\imgconst\pexels-rostislav-5011647.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding: 0;
  display: flex;
  justify-content: center;
  place-items: center;
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate(); // Khai báo useNavigate
  // Validate email format
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate email format
    if (!validateEmail(email)) {
      setEmailError("Invalid email format.");
      return;
    } else {
      setEmailError("");
    }

    // Validate password length
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    } else {
      setPasswordError("");
    }

    try {
      const response = await axios.post("http://localhost:9999/login", {
        email,
        password,
      });

      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      } else if (response.data.status === "inactive") {
        alert(response.data.message); // Hiển thị thông báo tài khoản chưa được kích hoạt
      } else {
        alert("Login failed");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setEmailError("Invalid email or password.");
      } else {
        setEmailError("An error occurred. Please try again.");
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="bg-image-login">
      <Background>
        <Form onSubmit={handleSubmit}>
          <div className="flex-column">
            <label>Email</label>
            <div className="inputForm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-envelope-at"
                viewBox="0 0 16 16"
              >
                <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
                <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z" />
              </svg>
              <input
                type="text"
                className="input"
                name="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {emailError && <p className="error-message">{emailError}</p>}
          </div>

     
          <div className="flex-column">
            <label>Password</label>
            <div className="inputForm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-lock-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
              </svg>
              <input
                type={passwordVisible ? "text" : "password"}
                className="input"
                name="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={togglePasswordVisibility} className="eye-icon">
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>

   
          <div className="flex-row">
            <div>
              <input type="checkbox" />
              <label style={{ marginLeft: 10 }}>Remember me</label>
            </div>
            <Link className="span" to={"/auth/forgotpass"}>
              Forgot password?
            </Link>
          </div>

          <button className="button-submit">Sign In</button>

          <p className="p">
            Don't have an account?{" "}
            <Link className="span" to={"/auth/signup"}>
              Sign Up
            </Link>
          </p>
        </Form>
      </Background>
    </div>
  );
}

export default Login;
