import * as React from "react";
import "./Header.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row, Image } from "react-bootstrap";

const AccountMenu = () => {
  const companyName = "Công ty cổ phần tập đoàn trí tuệ ***";
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleClick = (event) => {
    // Ngăn sự kiện tiếp tục từ nút avatar, không để nó gây ra sự kiện "outside click"
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };
  useEffect(() => {
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
        <Col xs={3} style={{ display: "flex", justifyContent: "center" }}>
          <div>
            {companyName.split("").map((letter, index) => (
              <span
                key={index}
                className={letter === " " ? "letter space" : "letter"}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
        </Col>
        {/* Contact Link */}
        <Col xs={3} className="d-flex justify-content-end">
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
              style={{ marginLeft: "10px", textAlign: "left", color: "white" }}
            >
              <div>User name</div>
              <div>User</div>
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
        </Col>
      </Row>
    </Container>
  );
};

export default AccountMenu;
