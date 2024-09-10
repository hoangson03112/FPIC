import * as React from "react";
import "./Header.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row, Image } from "react-bootstrap";
import AccountContext from "../http/AccountContext";

const AccountMenu = ({ onToggleMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [account, setAccount] = useState({});

  const handleClick = (event) => {
    // Ngăn sự kiện tiếp tục từ nút avatar, không để nó gây ra sự kiện "outside click"
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AccountContext.Authentication(); // Đảm bảo Authentication là một hàm async
        setAccount(data.account);
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    fetchData(); // Gọi hàm async

    // Hàm xử lý sự kiện click bên ngoài
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    // Dọn dẹp sự kiện khi component bị unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []); // Chạy effect chỉ một lần khi component mount

  return (
    <Container fluid className="account-menu">
      <Row className="align-items-center">
        {/* Logo */}
        <Col xs={1}>
          <Link to={"/"}>
            <Image
              src="/logo192.png"
              style={{
                width: "60%",
              }}
            />
          </Link>
        </Col>
        <Col xs={1}>
          <button
            onClick={onToggleMenu}
            className="menu-toggle-button"
            aria-controls="side-menu"
            aria-haspopup="true"
            aria-expanded="false"
            style={{
              backgroundColor: onToggleMenu
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(255, 255, 255, 0.2)",
              transition: "background-color 0.3s ease",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-menu-button-wide"
              viewBox="0 0 16 16"
              style={{ margin: 0 }}
            >
              <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v2A1.5 1.5 0 0 1 14.5 5h-13A1.5 1.5 0 0 1 0 3.5zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z" />
              <path d="M2 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m10.823.323-.396-.396A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0M0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5" />
            </svg>
          </button>
        </Col>
        {/* Search bar */}
        <Col xs={3}>
          <Col>
            <div className="srch">
              <input
                type="text"
                name="text"
                className="inputsrch"
                required
                placeholder="Type to search..."
              />
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ionicon"
                  viewBox="0 0 512 512"
                >
                  <title>Search</title>
                  <path
                    d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit="10"
                    stroke-width="32"
                  ></path>
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    strokeMiterlimit="10"
                    stroke-width="32"
                    d="M338.29 338.29L448 448"
                  ></path>
                </svg>
              </div>
            </div>
          </Col>
        </Col>

        {/* Contact Link */}
        <Col xs={2} className="d-flex justify-content-end">
          <Link
            className="account-menu-item"
            to="/contact"
            style={{
              textDecoration: "none",
              color: "white",
            }}
          >
            Contact
          </Link>
        </Col>

        {/* User info and Account Menu */}
        <Col xs={2} className="d-flex justify-content-start align-items-center">
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            {account?.fullName ? (
              <div>
                <button
                  onClick={handleClick}
                  className="avatar-button"
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
                  <div>{account?.fullName}</div>
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
                      <Link to="/myaccount" className="lik">
                        My Account
                      </Link>
                    </div>

                    <div className="menu-item">
                      <div className="menu-icon">🚪</div>
                      <Link to="/logout" className="lik">
                        Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/auth/login">Đăng nhập</a>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountMenu;
