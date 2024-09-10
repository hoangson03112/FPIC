import axios from "axios";

class AccountContext {
  async Authentication() {
    try {
      const response = await axios.get("http://localhost:9999/authentication");

      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return error;
    }
  }
}
// eslint-disable-next-line import/no-anonymous-default-export
export default new AccountContext();
