import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import AccountContext from "../http/AccountContext";
import axios from "axios";
import { REACT_APP_URL_SERVER, REACT_APP_URL_BE } from "../config";

const AdminDashboard = () => {
  const [countUser, setCountUser] = useState(0);
  const [countImages, setCountImages] = useState(0);
  const [countMicrochip, setCountMicrochip] = useState(0);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await AccountContext.getCountUser();
        setCountUser(response.data.count);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error server...",
          text: "Có lỗi xảy ra khi lấy danh sách tài khoản.",
        });
        console.error("Failed to fetch accounts:", error);
      }
    };

    const fetchImages = async () => {
      try {
        const response = await axios.get(`${REACT_APP_URL_BE}/images/count`);
        setCountImages(response.data.count);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error server...",
          text: "Có lỗi xảy ra khi lấy danh sách tài khoản.",
        });
        console.error("Failed to fetch accounts:", error);
      }
    };

    const fetchMicrochip = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_URL_BE}/images-microchip/count`
        );
        setCountMicrochip(response.data.count);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error server...",
          text: "Có lỗi xảy ra khi lấy danh sách tài khoản.",
        });
        console.error("Failed to fetch accounts:", error);
      }
    };
    fetchMicrochip();
    fetchImages();
    fetchAccounts();
  }, []);

  return (
    <Container fluid className="mt-4 h-100" style={{ minHeight: "100vh" }}>
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row>
        <Col md={4}>
          <Card className="text-center mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Tổng số người dùng</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {countUser}
              </Card.Text>
              <Button variant="primary" href="/admin/manager-account/admin">
                Quản lý người dùng
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Tổng số mẫu linh kiện</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {countImages}
              </Card.Text>
              <Button variant="primary" href="/page/1">
                Mẫu linh kiện
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Tổng số mẫu bản mạch</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {countMicrochip}
              </Card.Text>
              <Button variant="primary" href="/microchip">
                Mẫu bản mạch
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
