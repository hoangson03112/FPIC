import * as React from "react";
import "./Header.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row, Image } from "react-bootstrap";
import AccountContext from "../http/AccountContext";
import { useNavigate } from "react-router-dom";

const Header = ({ onToggleMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [account, setAccount] = useState({});

  const navigate = useNavigate();
  const handleClick = (event) => {
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");
    window.location.reload();
  };
  function navigateTo() {
    window.location.href = "http://localhost:3000/auth/login";
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AccountContext.Authentication();

        setAccount(data.account);
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    fetchData(); // Gọi hàm async

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <Container fluid className="account-menu">
      <Row className="align-items-center">
        <Col xs={1}>
          <span onClick={onToggleMenu} className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              fill="currentColor"
              className="bi bi-list mt-3 ms-5"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
              />
            </svg>
          </span>
        </Col>

        <Col md={10} className="d-flex justify-content-end align-items-center">
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            {account?.lastName && account?.firstName ? (
              <div>
                <button
                  onClick={handleClick}
                  className="avatar-button pb-1"
                  aria-controls={isOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={isOpen ? "true" : undefined}
                >
                  <div className="avatar">M</div>
                </button>
                <div
                  style={{
                    marginLeft: "10px",
                    textAlign: "left",
                    color: "white",
                  }}
                >
                  <div>{account?.lastName + " " + account?.firstName}</div>
                </div>
                {isOpen && (
                  <div id="account-menu" className="menu" ref={menuRef}>
                    <div className="menu-item">
                      <div className="menu-item-avatar" />
                      <Link to="/profile" className="lik">
                        Profile
                      </Link>
                    </div>
                    <div className="menu-item">
                      <div className="menu-item-avatar" />
                      <Link to="/my-account" className="lik">
                        My Account
                      </Link>
                    </div>

                    <div className="menu-item">
                      <div className="menu-icon">🚪</div>
                      <Link to="/" className="lik" onClick={handleLogout}>
                        Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button class="full-rounded" onClick={navigateTo}>
                <span>Đăng Nhập</span>
                <div class="border full-rounded"></div>
              </button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
