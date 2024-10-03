import * as React from "react";
import { Outlet, useLocation, Link } from "react-router-dom"; // Sử dụng Link từ react-router-dom
import Header from "./elements/Header";
import { Container } from "react-bootstrap";

const Layout = () => {
  const [isMenuOpen, setMenuOpen] = React.useState(true);
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  const currentPath = location.pathname; // Lưu trữ đường dẫn hiện tại
  console.log(currentPath);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev); // Cập nhật trạng thái menu
  };

  return (
    <div>
      {/* Header */}
      <Header onToggleMenu={toggleMenu} />

      {/* Sidebar và nội dung */}
      <div className="d-flex">
        <nav
          className={`side-menu ${
            isMenuOpen ? "open" : "closed"
          } bg-dark rounded border-end border-4 border-dark`}
        >
          <ul className="list-group">
            <li
              className={`list-group-item border-0 p-3 text-light ${
                currentPath === "/" ? "active bg-primary" : "bg-dark"
              }`}
              aria-current="true"
            >
              <Link to="/" className="text-decoration-none text-light">
                Trang chủ
              </Link>
            </li>
            <li
              className={`list-group-item border-0 p-3 text-light ${
                currentPath === "/admin/manager-account"
                  ? "active bg-primary"
                  : "bg-dark"
              }`}
            >
              <Link
                to="/admin/manager-account"
                className="text-decoration-none text-light"
              >
                Quản lý tài khoản
              </Link>
            </li>
            <li
              className={`list-group-item border-0 p-3 text-light ${
                currentPath === "/page/1" ? "active bg-primary" : "bg-dark"
              }`}
            >
              <Link to="/page/1" className="text-decoration-none text-light">
                Mẫu linh kiện
              </Link>
            </li>
            <li
              className={`list-group-item border-0 p-3 text-light ${
                currentPath === "/admin/manager-reviews"
                  ? "active bg-primary"
                  : "bg-dark"
              }`}
            >
              <Link
                to="/admin/manager-reviews"
                className="text-decoration-none text-light"
              >
                Quản lí đánh giá
              </Link>
            </li>
            <li
              className={`list-group-item border-0 p-3 text-light ${
                currentPath === "/admin/manager-reviews"
                  ? "active bg-primary"
                  : "bg-dark"
              }`}
            >
              <Link to="/microchip" className="text-decoration-none text-light">
                Quản lí vi mạch
              </Link>
            </li>
          </ul>
        </nav>

        <Container
          fluid
          className={`p-0 main-content ${isMenuOpen ? "shrinked" : ""}`}
          style={{ height: "100vh" }}
        >
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;
