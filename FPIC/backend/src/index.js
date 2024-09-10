const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const IMAGES_DIR = path.join(__dirname, "img");
const fs = require("fs");

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

app.get("/images", (req, res) => {
  fs.readdir(IMAGES_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error reading directory", err });
    }

    // Lọc các tệp ảnh (định dạng jpg, png, jpeg, v.v.)
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img1: `/img/${file}`,
      }));

    res.json(images);
  });
});

app.post("/get-json-file", (req, res) => {
  const { fileName } = req.body; // Lấy tên file từ request body

  const filePath = path.join(
    "D:\\Git\\FPIC\\FPIC\\backend\\src\\ann",
    fileName + ".json"
  ); // Đường dẫn đến file

  // Kiểm tra xem file có tồn tại không
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "File not found" });
    }

    // Đọc nội dung file JSON
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error reading file", error: err });
      }

      try {
        const jsonData = JSON.parse(data);
        res.json({ jsonData });
      } catch (parseErr) {
        res
          .status(500)
          .json({ message: "Error parsing JSON", error: parseErr });
      }
    });
  });
});
app.get("/get-classes", (req, res) => {
  // Xác định đường dẫn tới file JSON cố định
  const filePath = path.join("D:\\Git\\FPIC\\FPIC\\backend\\src", "meta.json");

  // Kiểm tra xem file có tồn tại không
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }

    // Đọc file JSON
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Error reading file" });
      }

      // Chuyển đổi dữ liệu JSON từ chuỗi sang object và trả về client
      try {
        const jsonData = JSON.parse(data);
        res.json({ jsonData });
      } catch (error) {
        res.status(500).json({ error: "Error parsing JSON" });
      }
    });
  });
});









app.use("/images", express.static(IMAGES_DIR));

app.listen(9999, () => console.log("Server is running on port 9999"));
