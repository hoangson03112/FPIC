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
          <h2 className="text-white">Quản lý tài khoản</h2>
        </Col>
        <Col md={2} className="text-end">
          <button class="animated-button" onClick={() => setShowModal(true)}>
            <svg
              viewBox="0 0 20 20"
              className="arr-2 mt-1 "
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
            </svg>
            <span class="text"> Thêm tài khoản</span>
            <span class="circle"></span>
            <svg
              viewBox="0 0 20 20"
              className="arr-1 mt-1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
            </svg>
          </button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <div class="group">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="search-icon">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>

            <input
              id="query"
              class="input"
              type="search"
              placeholder="Tìm kiếm theo email..."
              name="searchbar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
        <Col className="card p-0">
          <div className="card-body ">
            <div className="table-responsive">
              <table className="table align-middle mb-0 ">
                <thead className="bg-light ">
                  <tr className="text-center ">
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
                    <tr key={account?._id} className="text-center align-middle">
                      <td>{index + 1}</td>
                      <td>{account?.firstName}</td>
                      <td>{account?.lastName}</td>
                      <td>{account?.email}</td>
                      <td>{account?.role}</td>
                      <td>{account?.status}</td>
                      <td>
                        <Button
                          variant="btn btn-outline-warning"
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
                          variant="btn btn-outline-danger"
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
              </table>
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal thêm tài khoản mới */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header
          closeButton
          className="bg-primary text-white py-3"
          style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
        >
          <Modal.Title className="mx-auto">Tạo tài khoản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-5">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">
                Tên tài khoản
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên tài khoản"
                className="form-control-lg rounded-pill"
                value={newAccount.username}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                className="form-control-lg rounded-pill"
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, password: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên"
                className="form-control-lg rounded-pill"
                value={newAccount.firstName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, firstName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Họ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ"
                className="form-control-lg rounded-pill"
                value={newAccount.lastName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, lastName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email"
                className="form-control-lg rounded-pill"
                value={newAccount.email}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, email: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer
          className="d-flex justify-content-center py-3"
          style={{ borderRadius: "0 0 0.5rem 0.5rem" }}
        >
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4 py-2"
            onClick={() => setShowModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            className="rounded-pill px-4 py-2 ml-2"
            onClick={handleCreateAccount}
          >
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal cập nhật tài khoản */}
      <Modal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          className="bg-info text-white py-3"
          style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
        >
          <Modal.Title className="mx-auto">Cập nhật tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-5">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">
                Tên tài khoản
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên tài khoản"
                className="form-control-lg rounded-pill"
                value={accountUpdated.username}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    username: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên"
                className="form-control-lg rounded-pill"
                value={accountUpdated.firstName}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    firstName: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Họ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ"
                className="form-control-lg rounded-pill"
                value={accountUpdated.lastName}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    lastName: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email"
                className="form-control-lg rounded-pill"
                value={accountUpdated.email}
                onChange={(e) =>
                  setAccountUpdated({
                    ...accountUpdated,
                    email: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="">
              <Form.Label className="font-weight-bold">Tình trạng</Form.Label>
              <div className="radio-inputs d-flex  mt-3">
                <label className="radio-tile-container">
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
                <label className="radio-tile-container">
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
        <Modal.Footer
          className="d-flex justify-content-center py-3"
          style={{ borderRadius: "0 0 0.5rem 0.5rem" }}
        >
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4 py-2"
            onClick={() => setShowUpdateModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="info"
            className="rounded-pill px-4 py-2 ml-2 text-white"
            onClick={handleUpdateAccount}
          >
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
