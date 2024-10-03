import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const AdminDashboard = () => {
  return (
    <Container fluid className="mt-4 h-100" style={{ minHeight: "100vh" }}>
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row>
        <Col md={4}>
          <Card className="text-center mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Tổng số người dùng</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                1,250
              </Card.Text>
              <Button variant="primary" href="/admin/users">
                Quản lý người dùng
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Tổng số đánh giá</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                1,250
              </Card.Text>
              <Button variant="primary" href="/admin/users">
                Quản lý đánh giá
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Tổng số linh kiện</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                1,250
              </Card.Text>
              <Button variant="primary" href="/admin/users">
                Quản lý linh kiện
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
