import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  Modal,
} from "react-bootstrap";
import AccountContext from "../http/AccountContext";
import "./ManageAccount.css";

const ManageAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [accountToUpdate, setAccountToUpdate] = useState(null);

  const [newAccount, setNewAccount] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [accountUpdated, setAccountUpdated] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    status: "",
  });

  // Fetch danh sách tài khoản từ API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await AccountContext.getAllAccounts();

        if (response.status === 401) {
          setErrorMessage("Chưa đăng nhập.");
        } else if (response.status === 403) {
          setErrorMessage("Bạn không có quyền truy cập tài nguyên này.");
        } else if (response.status === "success" && response.accounts) {
          setAccounts(response.accounts);
          setFilteredAccounts(response.accounts);
          setErrorMessage(""); // Xóa thông báo lỗi trước đó
        } else {
          setErrorMessage(
            response.message || "Có lỗi xảy ra khi lấy danh sách tài khoản."
          );
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        setErrorMessage("Có lỗi xảy ra khi lấy danh sách tài khoản.");
      }
    };

    fetchAccounts();
  }, []);

  const handleCreateAccount = async () => {
    try {
      const response = await AccountContext.createAccount(newAccount);

      if (response.status === 201) {
        // Thêm tài khoản mới vào danh sách và lọc
        const updatedAccounts = [...accounts, response.data.account];
        setAccounts(updatedAccounts);
        setFilteredAccounts(updatedAccounts);
        setShowModal(false);
        // Reset form thêm tài khoản
        setNewAccount({
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          email: "",
        });
        setErrorMessage("");
      } else {
        setErrorMessage(response.data.message);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      setErrorMessage("Có lỗi xảy ra khi tạo tài khoản.");
    }
  };

  const handleUpdateAccount = async () => {
    try {
      const response = await AccountContext.updateAccount(
        accountToUpdate._id,
        accountUpdated
      );
      if (response.status === 200) {
        const updatedAccounts = accounts.map((account) =>
          account._id === accountUpdated._id ? accountUpdated : account
        );
        setAccounts(updatedAccounts);
        setFilteredAccounts(updatedAccounts);
        setShowUpdateModal(false);
        setErrorMessage("");
      } else {
        setErrorMessage("Có lỗi xảy ra khi cập nhật tài khoản.");
      }
    } catch (error) {
      console.error("Failed to update account:", error);
      setErrorMessage("Có lỗi xảy ra khi cập nhật tài khoản.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      const response = await AccountContext.deleteAccount(accountToDelete._id);

      if (response.status === 200) {
        // Cập nhật danh sách tài khoản sau khi xóa
        const updatedAccounts = accounts.filter(
          (account) => account._id !== accountToDelete._id
        );
        setAccounts(updatedAccounts);
        setFilteredAccounts(updatedAccounts);
        setShowDeleteModal(false);
        setErrorMessage("");
      } else {
        setErrorMessage("Có lỗi xảy ra khi xóa tài khoản.");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      setErrorMessage("Có lỗi xảy ra khi xóa tài khoản.");
    }
  };

  useEffect(() => {
    const results = accounts.filter((account) =>
      account.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredAccounts(results);
  }, [search, accounts]);

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h2>Quản lý tài khoản</h2>
        </Col>
        <Col md={2} className="text-end">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Thêm tài khoản
          </Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>
      {errorMessage && (
        <Row>
          <Col>
            <div className="alert alert-danger">{errorMessage}</div>
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr className="text-center">
                <th>#</th>
                <th>Tên</th>
                <th>Họ</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Tình trạng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account, index) => (
                <tr key={account?._id} className="text-center">
                  <td>{index + 1}</td>
                  <td>{account?.firstName}</td>
                  <td>{account?.lastName}</td>
                  <td>{account?.email}</td>
                  <td>{account?.role}</td>
                  <td>{account?.status}</td>

                  <td>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => {
                        setAccountToUpdate(account);
                        setAccountUpdated({ ...account });
                        setShowUpdateModal(true);
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setAccountToDelete(account);
                        setShowDeleteModal(true);
                      }}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Modal thêm tài khoản mới */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo tài khoản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên tài khoản</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên tài khoản"
                value={newAccount.username}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, password: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên"
                value={newAccount.firstName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, firstName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ"
                value={newAccount.lastName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, lastName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email"
                value={newAccount.email}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, email: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCreateAccount}>
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal cập nhật tài khoản */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên tài khoản</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên tài khoản"
                value={accountUpdated.username}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    username: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên"
                value={accountUpdated.firstName}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    firstName: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Họ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ"
                value={accountUpdated.lastName}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    lastName: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email"
                value={accountUpdated.email}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    email: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tình trạng</Form.Label>

              <div className="radio-inputs">
                <label>
                  <input
                    className="radio-input"
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={accountUpdated.status === "inactive"}
                    onChange={(e) =>
                      setAccountUpdated({
                        ...accountUpdated,
                        status: e.target.value,
                      })
                    }
                  />
                  <span className="radio-tile">
                    <span className="radio-label">Inactive</span>
                  </span>
                </label>
                <label>
                  <input
                    className="radio-input"
                    type="radio"
                    name="status"
                    value="active"
                    checked={accountUpdated.status === "active"}
                    onChange={(e) =>
                      setAccountUpdated({
                        ...accountUpdated,
                        status: e.target.value,
                      })
                    }
                  />
                  <span className="radio-tile">
                    <span className="radio-label">Active</span>
                  </span>
                </label>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateAccount}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận xóa tài khoản */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể
          hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageAccount;
