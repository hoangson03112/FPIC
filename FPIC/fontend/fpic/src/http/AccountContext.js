import axios from "axios";
import Cookies from "js-cookie";

class AccountContext {
  async Authentication() {
    try {
      // Lấy token từ cookie
      const token = Cookies.get("token");

      // Kiểm tra nếu không có token
      if (!token) {
        return { message: "Chưa đăng nhập", status: 401 };
      }

      // Gửi request với token trong header Authorization
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
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AccountContext();
