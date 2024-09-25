import axios from "axios";

class AccountContext {
  async Authentication() {
    try {
      // Lấy token từ cookie
      const token = localStorage.getItem("token");

      // Kiểm tra nếu không có token
      if (!token) {
        return { message: "Chưa đăng nhập", status: 401 };
      }

      const response = await axios.get("http://localhost:9999/authentication", {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return error;
    }
  }

  async getAllAccounts() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:9999/admin/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);

      if (error.response) {
        if (error.response.status === 401) {
          return { message: "Chưa đăng nhập", status: 401 };
        } else if (error.response.status === 403) {
          return {
            message: "Bạn không có quyền truy cập tài nguyên này.",
            status: 403,
          };
        }
      }

      return {
        message: "Có lỗi xảy ra khi lấy danh sách tài khoản.",
        status: 500,
      };
    }
  }

  async createAccount(account) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return { message: "Chưa đăng nhập", status: 401 };
      }

      const response = await axios.post(
        "http://localhost:9999/admin/create-account",
        { account }, // Truyền dữ liệu account trong body của request
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response; // Trả về kết quả từ server
    } catch (error) {
      console.error("Error creating account:", error);
      return error.response || { message: "Có lỗi xảy ra khi tạo tài khoản" };
    }
  }
  async deleteAccount(id) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return { message: "Chưa đăng nhập", status: 401 };
      }

      const response = await axios.delete(
        "http://localhost:9999/admin/delete-account",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            id, // Truyền id trong `data`
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating account:", error);
      return error.response || { message: "Có lỗi xảy ra khi tạo tài khoản" };
    }
  }

  async updateAccount(id, accountUpdated) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return { message: "Chưa đăng nhập", status: 401 };
      }

      // Cấu hình header với token để xác thực
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.put(
        `http://localhost:9999/admin/update-account/${id}`,
        accountUpdated, // Dữ liệu tài khoản cập nhật
        config // Cấu hình header
      );

      return {
        message: "Cập nhật thành công",
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating account:", error);
      return (
        error.response || { message: "Có lỗi xảy ra khi cập nhật tài khoản" }
      );
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AccountContext();
