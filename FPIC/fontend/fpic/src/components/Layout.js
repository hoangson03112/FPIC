import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Offcanvas, Button, Container, Nav } from "react-bootstrap";

const Layout = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="">
      <span onClick={handleShow}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          fill="currentColor"
          className="bi bi-list mt-5 ms-5"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          />
        </svg>
      </span>

      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" onClick={handleClose}>
              Trang chủ
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin/manager-account"
              onClick={handleClose}
            >
              Quản kí tài khoản
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/admin/manager- feedback"
              onClick={handleClose}
            >
              Quản kí đánh giá
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid className="flex-grow-1">
        <Outlet />
      </Container>
    </div>
  );
};

export default Layout;
