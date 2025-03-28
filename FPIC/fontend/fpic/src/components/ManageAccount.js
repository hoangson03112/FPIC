import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Badge,
} from "react-bootstrap";
import AccountContext from "../http/AccountContext";
import "./ManageAccount.css";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiSearch,
  FiShield,
  FiSave,
  FiAlertTriangle,
  FiAlertCircle,
  FiUser,
  FiLock,
  FiInfo,
  FiMail,
} from "react-icons/fi";

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
    password: "",
    fullName: "",
    email: "",
  });
  const [accountUpdated, setAccountUpdated] = useState({
    password: "",
    fullName: "",
    email: "",
    status: "",
  });

  const { type } = useParams();

  const roleTranslations = {
    admin: "Quản trị viên",
    editor: "Đánh giá viên",
    viewer: "Khách hàng",
    assessor: "Đánh giá viên",
    user: "Người dùng",
  };

  const fetchAccounts = async () => {
    try {
      const response = await AccountContext.getAllAccounts();

      if (response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Bạn chưa đăng nhập...",
          text: "Vui lòng đăng nhập!",
        });
      } else if (response.status === 403) {
        setErrorMessage("Bạn không có quyền truy cập tài nguyên này.");
      } else if (response.status === "success" && response.accounts) {
        console.log(response.accounts);

        setAccounts(
          response.accounts.filter((account) => account.role === type)
        );
        setFilteredAccounts(
          response.accounts.filter((account) => account.role === type)
        );
        setErrorMessage("");
      } else {
        setErrorMessage(
          response.message || "Có lỗi xảy ra khi lấy danh sách tài khoản."
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi server...",
        text: "Có lỗi xảy ra khi lấy danh sách tài khoản.",
      });
      console.error("Failed to fetch accounts:", error);
      setErrorMessage("Có lỗi xảy ra khi lấy danh sách tài khoản.");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [type]);

  const handleCreateAccount = async () => {
    try {
      const response = await AccountContext.createAccount({
        ...newAccount,
        role: type,
      });

      if (response.status === 201) {
        const updatedAccounts = [...accounts, response.data.account];
        setAccounts(updatedAccounts);
        setFilteredAccounts(updatedAccounts);
        setShowModal(false);

        setNewAccount({
          password: "",
          fullName: "",
          email: "",
        });

        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Tài khoản đã được tạo thành công.",
        });
        setErrorMessage("");
      } else {
        setErrorMessage(response.data.message);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi server...",
        text: "Có lỗi xảy ra khi tạo tài khoản",
      });
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
        fetchAccounts();
        setFilteredAccounts(updatedAccounts);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Cập nhật tài khoản thành công!",
          confirmButtonText: "OK",
        });
        setShowUpdateModal(false);
        setErrorMessage("");
      } else {
        setErrorMessage("Có lỗi xảy ra khi cập nhật tài khoản.");
      }
    } catch (error) {
      console.error("Failed to update account:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi server...",
        text: "Có lỗi xảy ra khi cập nhật tài khoản",
      });
      setErrorMessage("Có lỗi xảy ra khi cập nhật tài khoản.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      const response = await AccountContext.deleteAccount(accountToDelete._id);

      if (response.status === 200) {
        const updatedAccounts = accounts.filter(
          (account) => account._id !== accountToDelete._id
        );
        setAccounts(updatedAccounts);
        setFilteredAccounts(updatedAccounts);
        setShowDeleteModal(false);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Xóa tài khoản thành công!",
          confirmButtonText: "OK",
        });
        setErrorMessage("");
      } else {
        setErrorMessage("Có lỗi xảy ra khi xóa tài khoản.");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi server...",
        text: "Có lỗi xảy ra khi xóa tài khoản",
      });
      setErrorMessage("Có lỗi xảy ra khi xóa tài khoản.");
    }
  };

  useEffect(() => {
    const results = accounts.filter(
      (account) =>
        account.email.toLowerCase().includes(search.toLowerCase()) ||
        account.fullName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredAccounts(results);
  }, [search, accounts]);

  return (
    <Container fluid className="px-4 py-3">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="text-dark fw-bold mb-0">
            <FiShield className="me-2" />
            Quản lý tài khoản {type && `(${roleTranslations[type] || type})`}
          </h2>
        </Col>
        <Col md="auto">
          <Button
            variant="primary"
            className="rounded-pill px-4"
            onClick={() => setShowModal(true)}
          >
            <FiUserPlus className="me-2" />
            Thêm tài khoản
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="search"
              className="form-control search-input"
              placeholder="Tìm kiếm theo email hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      {errorMessage && (
        <Row className="mb-3">
          <Col>
            <div className="alert alert-danger alert-dismissible fade show">
              {errorMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setErrorMessage("")}
              />
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center" style={{ width: "5%" }}>
                        #
                      </th>
                      <th style={{ width: "25%" }}>Họ và tên</th>
                      <th style={{ width: "30%" }}>Email</th>
                      <th className="text-center" style={{ width: "15%" }}>
                        Vai trò
                      </th>
                      <th className="text-center" style={{ width: "15%" }}>
                        Tình trạng
                      </th>
                      <th className="text-center" style={{ width: "15%" }}>
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account, index) => (
                        <tr key={account?._id}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                                <span className="text-dark">
                                  {account?.fullName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">{account?.email}</span>
                          </td>
                          <td className="text-center">
                            <Badge
                              bg={
                                account?.role === "admin"
                                  ? "danger"
                                  : account?.role === "assessor"
                                  ? "warning"
                                  : "primary"
                              }
                              className="px-3 py-2 rounded-pill"
                            >
                              {roleTranslations[account?.role] || account?.role}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge
                              bg={
                                account?.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="px-3 py-2 rounded-pill"
                            >
                              {account?.status === "active"
                                ? "Đang hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setAccountToUpdate(account);
                                setAccountUpdated({ ...account });
                                setShowUpdateModal(true);
                              }}
                            >
                              <FiEdit2 className="me-1" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setAccountToDelete(account);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FiTrash2 className="me-1" />
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="text-muted">
                            {search
                              ? "Không tìm thấy tài khoản phù hợp"
                              : "Không có tài khoản nào"}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Create Account Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
        className="modal-fade-transform"
      >
        <Modal.Header
          closeButton
          className="border-0 pb-3 pt-4 px-4"
          style={{
            background: "linear-gradient(to right, #4361ee, #3a0ca3)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Modal.Title className="d-flex align-items-center text-white">
            <div
              className="d-flex align-items-center justify-content-center me-3"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.2)",
              }}
            >
              <FiUserPlus size={20} />
            </div>
            <div>
              <h5 className="mb-0 fw-semibold">Tạo tài khoản mới</h5>
              <small className="opacity-85">Thêm người dùng vào hệ thống</small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 px-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium text-dark mb-2">
                Họ và tên
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiUser className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={newAccount.fullName}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, fullName: e.target.value })
                  }
                  className="py-2 border-start-0"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium text-dark mb-2">
                Mật khẩu
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiLock className="text-muted" />
                </span>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                  value={newAccount.password}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, password: e.target.value })
                  }
                  className="py-2 border-start-0"
                />
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">
                  <FiInfo className="me-1" />
                  Mật khẩu phải có ít nhất 8 ký tự
                </small>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium text-dark mb-2">
                Email
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiMail className="text-muted" />
                </span>
                <Form.Control
                  type="email"
                  placeholder="Nhập email hợp lệ"
                  value={newAccount.email}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                  className="py-2 border-start-0"
                />
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-medium text-dark mb-2">
                Vai trò
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiShield className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  value={roleTranslations[type] || type}
                  readOnly
                  disabled
                  className="py-2 bg-light border-start-0"
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            className="px-4 rounded-2 fw-medium"
            style={{ minWidth: "120px" }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateAccount}
            className="px-4 rounded-2 fw-medium shadow-sm"
            style={{
              minWidth: "120px",
              background: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)",
              border: "none",
            }}
          >
            <FiUserPlus className="me-2" />
            Tạo tài khoản
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Account Modal */}
      <Modal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        centered
        backdrop="static"
        className="modal-fade-transform"
      >
        <Modal.Header
          closeButton
          className="border-0 pb-3 pt-4 px-4"
          style={{
            background: "linear-gradient(to right, #4895ef, #4361ee)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Modal.Title className="d-flex align-items-center text-white">
            <div
              className="d-flex align-items-center justify-content-center me-3"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.2)",
              }}
            >
              <FiEdit2 size={20} />
            </div>
            <div>
              <h5 className="mb-0 fw-semibold">Cập nhật tài khoản</h5>
              <small className="opacity-85">
                Chỉnh sửa thông tin người dùng
              </small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 px-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium text-dark mb-2">
                Họ và tên
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiUser className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={accountUpdated.fullName}
                  onChange={(e) =>
                    setAccountUpdated({
                      ...accountUpdated,
                      fullName: e.target.value,
                    })
                  }
                  className="py-2 border-start-0"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium text-dark mb-2">
                Email
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiMail className="text-muted" />
                </span>
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
                  className="py-2 border-start-0"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium text-dark mb-2">
                Vai trò
              </Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiShield className="text-muted" />
                </span>
                <Form.Select
                  value={accountUpdated.role}
                  onChange={(e) =>
                    setAccountUpdated({
                      ...accountUpdated,
                      role: e.target.value,
                    })
                  }
                  className="py-2 border-start-0"
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="assessor">Đánh giá viên</option>
                </Form.Select>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-medium text-dark mb-2 d-block">
                Tình trạng
              </Form.Label>
              <div className="d-flex gap-4">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="active-status"
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
                  <label className="form-check-label" htmlFor="active-status">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-success rounded-circle me-2"
                        style={{ width: "10px", height: "10px" }}
                      ></div>
                      <span>Hoạt động</span>
                    </div>
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="inactive-status"
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
                  <label className="form-check-label" htmlFor="inactive-status">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-secondary rounded-circle me-2"
                        style={{ width: "10px", height: "10px" }}
                      ></div>
                      <span>Không hoạt động</span>
                    </div>
                  </label>
                </div>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <Button
            variant="outline-secondary"
            onClick={() => setShowUpdateModal(false)}
            className="px-4 rounded-2 fw-medium"
            style={{ minWidth: "120px" }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="info"
            className="text-white px-4 rounded-2 fw-medium shadow-sm"
            onClick={handleUpdateAccount}
            style={{
              minWidth: "120px",
              background: "linear-gradient(135deg, #36b9cc 0%, #1a7a8c 100%)",
              border: "none",
            }}
          >
            <FiSave className="me-2" />
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">
            <FiAlertTriangle className="me-2" size={24} />
            Xác nhận xóa tài khoản
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger bg-soft-danger border-0">
            <div className="d-flex">
              <FiAlertCircle className="me-2 mt-1 flex-shrink-0" size={20} />
              <div>
                <h5 className="alert-heading mb-2">
                  Bạn có chắc chắn muốn xóa?
                </h5>
                <p className="mb-2">
                  Tài khoản{" "}
                  <strong className="text-dark">
                    {accountToDelete?.fullName}
                  </strong>{" "}
                  sẽ bị xóa vĩnh viễn.
                </p>
                <p className="mb-0 small text-muted">
                  Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ
                  bị mất.
                </p>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            className="px-4 rounded-pill"
          >
            Quay lại
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            className="px-4 rounded-pill shadow-sm"
          >
            <FiTrash2 className="me-1" />
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageAccount;
