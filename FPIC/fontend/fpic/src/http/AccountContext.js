import axios from "axios";

class AccountContext {
  async Authentication() {
    try {

      const token = localStorage.getItem("token");


      if (!token) {
        return { message: "Chưa đăng nhập", status: 401 };
      }
      const response = await axios.get("http://localhost:9999/authentication", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
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
        { account },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
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
            id
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
  async getCountUser() {
    try {
      const response = await axios.get(
        "http://localhost:9999/admin/accounts/count"

      );
 
      
      return {
        message: "Cập nhật thành công",
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating account:", error);
      return (
        error.response || { message: "Có lỗi xảy ra " }
      );
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AccountContext();
