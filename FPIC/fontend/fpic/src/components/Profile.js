import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../elements/Header";

function Profile() {
  return (
    <div className="bg-image">
      <Header />
      <Container fluid>
        <Row className="profile" style={{ height: "80vh" }}>
          <Col
            md={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Card>
              <Card.Img
                variant="top"
                src=""
                alt="Profile Avatar"
                style={{ width: 300, height: 150 }}
              />
              <Card.Body>
                <Card.Title>User Name</Card.Title>
                <Card.Text>user@example.com</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col
            md={8}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Form
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                width: "100%",
              }}
            >
              <Form.Group controlId="formFullName">
                <Form.Label>Full Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your full name" />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter password" />
              </Form.Group>

              <Form.Group controlId="formConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" placeholder="Confirm password" />
              </Form.Group>

              <button variant="primary" type="submit">
                Save Changes
              </button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Profile;
