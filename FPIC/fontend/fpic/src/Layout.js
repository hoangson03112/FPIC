import * as React from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import AccountContext from "./http/AccountContext";
import { useState, useEffect } from "react";
import "./Layout.css";
import Loader from "./components/Loader";
import { REACT_APP_URL_SERVER, REACT_APP_URL_BE } from "./config";

const Layout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [account, setAccount] = useState({});
  const [loading, setLoading] = useState(true);
  const [subMenus, setSubMenus] = useState({
    menu1: false,
    menu2: false,
    menu3: false,
  });

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  function navigateTo() {
    window.location.href = `/auth/login`;
  }

  function toggleSubMenu(menu) {
    setSubMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AccountContext.Authentication();
        setAccount(data.account);
      } catch (error) {
        console.error("Error fetching account data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (
      currentPath.includes("/page/") ||
      currentPath.includes("/microchip") ||
      currentPath.includes("/weak-point") ||
      currentPath.includes("/block-diagram")
    ) {
      setSubMenus((prev) => ({ ...prev, menu1: true }));
    }
    if (currentPath.includes("/admin/manager-account")) {
      setSubMenus((prev) => ({ ...prev, menu3: true }));
    }
  }, [currentPath]);
  return (
    <div className="row">
      {loading && <Loader />}
      <div className="col-2 bg-custom p-0" style={{ minHeight: "100vh" }}>
        <div className="row mt-2">
          <div className="col-4 p-0">
            <div
              className="avatar bg-white border border-primary text-primary rounded-circle float-end"
              style={{ width: "80px", height: "80px" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="45"
                height="45"
                fill="currentColor"
                className="bi bi-shield-lock-fill m-0"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5"
                />
              </svg>
            </div>
          </div>

          <div className="text-white fs-4 col-8">
            {account?.firstName && account?.lastName ? (
              <div className="m-0 d-flex flex-column">
                <div className="">
                  {account.lastName + " " + account.firstName}
                </div>

                <button
                  className="fs-5 text-white m-0 text-start"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                className="btn btn-custom full-rounded w-50 mt-4"
                onClick={navigateTo}
              >
                <span className="text-white">Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
        <hr className="text-white" />
        <ul className="list-group list-group-flush fw-medium">
          <li
            className={`list-group-item border-0  ps-5 text-light ${
              currentPath === "/" ? "active bg-dark" : "bg-custom"
            }`}
            aria-current="true"
          >
            <Link to="/" className="text-decoration-none text-light fs-5">
              Trang chủ
            </Link>
          </li>
          <li
            className={`list-group-item border-0  px-0 bg-custom pb-0  ${
              (currentPath.includes("/page/") ||
                currentPath.includes("/microchip") ||
                currentPath.includes("/weak-point") ||
                currentPath.includes("/block-diagram")) &&
              "active bg-dark"
            }`}
          >
            <div
              className="text-decoration-none text-light py-1 dropdown-toggle fs-5 ps-5"
              onClick={() => toggleSubMenu("menu1")}
              style={{ cursor: "pointer" }}
            >
              Xây dựng dữ liệu
            </div>
            {subMenus.menu1 && (
              <ul className="list-group list-group-flush fs-5 ps-2">
                <li
                  className={`list-group-item border-0 ps-5 ${
                    currentPath.includes("/page/")
                      ? "active bg-white text-primary"
                      : "bg-custom text-white"
                  }`}
                >
                  <Link to="/page/1" className="dropdown-item fw-medium">
                    Mẫu linh kiện, chủng loại
                  </Link>
                </li>
                <li
                  className={`list-group-item border-0 ps-5 ${
                    currentPath.includes("/weak-point")
                      ? "active bg-white text-primary"
                      : "bg-custom text-white"
                  }`}
                >
                  <Link to="/weak-point" className="dropdown-item fw-medium">
                    Mẫu điểm yếu trên Bo mạch
                  </Link>
                </li>
                <li
                  className={`list-group-item border-0 ps-5 ${
                    currentPath.includes("/block-diagram")
                      ? "active bg-white text-primary"
                      : "bg-custom text-white"
                  }`}
                >
                  <Link to="/block-diagram" className="dropdown-item fw-medium">
                    Mẫu sơ đồ khối
                  </Link>
                </li>
                <li
                  className={`list-group-item border-0 ps-5 fw-medium ${
                    currentPath.includes("/microchip")
                      ? "active bg-white text-primary"
                      : "bg-custom text-white"
                  }`}
                >
                  <Link to="/microchip" className="dropdown-item fw-medium">
                    Mẫu bản mạch
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="list-group-item border-0 p-3 fs-5 px-0 text-light bg-custom pb-0">
            <div
              className="text-decoration-none text-light dropdown-toggle ps-5"
              onClick={() => toggleSubMenu("menu2")}
              style={{ cursor: "pointer" }}
            >
              Quản lý đánh giá
            </div>
            {subMenus.menu2 && (
              <ul className="list-group list-group-flush ps-2">
                <li className="list-group-item border-0 bg-custom ps-5">
                  <Link to="#" className="dropdown-item text-light fw-medium">
                    Danh mục sản phẩm đã đánh giá
                  </Link>
                </li>
                <li className="list-group-item border-0 bg-custom ps-5">
                  <Link to="#" className="dropdown-item text-light">
                    Kết quả đánh giá
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li
            className={`list-group-item border-0 fs-5 px-0 text-light bg-custom pb-0 ${
              currentPath.includes("/admin/manager-account/")
                ? "active bg-dark"
                : ""
            }`}
          >
            <div
              className="text-decoration-none text-light dropdown-toggle py-2 ps-5"
              onClick={() => toggleSubMenu("menu3")}
              style={{ cursor: "pointer" }}
            >
              Quản trị
            </div>
            {subMenus.menu3 && (
              <ul className="list-group list-group-flush bg-custom ps-2">
                <li
                  className={`list-group-item border-0 ps-5 ${
                    currentPath.includes("/admin/manager-account/admin")
                      ? "active bg-white text-primary"
                      : "bg-custom text-white"
                  }`}
                >
                  <Link
                    to="/admin/manager-account/admin"
                    className="dropdown-item "
                  >
                    Admin
                  </Link>
                </li>
                <li
                  className={`list-group-item border-0 ps-5 ${
                    currentPath.includes("/admin/manager-account/assessor")
                      ? "active bg-white text-primary"
                      : "bg-custom text-white"
                  }`}
                >
                  <Link
                    to="/admin/manager-account/assessor"
                    className="dropdown-item"
                  >
                    Đánh giá viên
                  </Link>
                </li>
                <li
                  className={`list-group-item border-0 ps-5 ${
                    currentPath.includes("/admin/manager-account/user")
                      ? "active bg-white text-primary"
                      : "bg-custom text-white"
                  }`}
                >
                  <Link
                    className="dropdown-item fw-medium"
                    to="/admin/manager-account/user"
                  >
                    Khách hàng
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="list-group-item border-0 p-3 px-0 fs-5 text-light bg-custom">
            <div className="text-decoration-none text-light ps-5">Biểu đồ</div>
          </li>
        </ul>
      </div>
      <div className="col-10 transition ps-1" style={{ height: "100%" }}>
        <Container fluid className="p-0 ">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;
