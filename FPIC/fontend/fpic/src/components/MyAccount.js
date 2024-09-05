import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../elements/Header";
import { useParams, useNavigate } from "react-router-dom";
import ScrollToTopButton from "../elements/ScrollToTopButton";
import axios from "axios";
import React, { useState, useEffect } from "react";
function MyAccount() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };
  return (
    <div className="bg-image">
      <Header onToggleMenu={toggleMenu} />
      <div className={`side-menu ${isMenuOpen ? "open" : "closed"}`}>
        <div>Menu Content</div>
        <Link to="/myaccount/dashboard">
          <button>Dashboard</button>
        </Link>
        <Link to="/myaccount/manageAccount">
          <button>Manager Accounts</button>
        </Link>
        <Link to="/myaccount/images">
          <button>Manager Images</button>
        </Link>
        <Link to="/myaccount/fllists">
          <button>Follow List</button>
        </Link>
      </div>
      <Container fluid>
        <Row className="profile" style={{ height: "80vh" }}>
          <Col className={`main-content ${isMenuOpen ? "shrinked" : ""}`}>
            <div>bsajdbhsdbhjbfjhb</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default MyAccount;
