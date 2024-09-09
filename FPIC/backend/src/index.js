const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const IMAGES_DIR = path.join(__dirname, "img");
const fs = require("fs");

app.use(
  cors({
    origin: "*", // Hoặc chỉ định domain của frontend nếu cần
  })
);
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

app.post("/post-json-file", (req, res) => {
  const { fileName } = req.body; // Lấy tên file từ request body

  const filePath = path.join(
    "D:\\downloads\\Git\\FPIC\\FPIC\\backend\\src\\ann",
    fileName + ".json"
  ); // Đường dẫn đến file

  // Kiểm tra xem file có tồn tại không
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not accessible:", filePath); // Thêm log

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
app.get("/get-json-file", (req, res) => {
  const { fileName } = req.query; // Lấy tên file từ query params

  if (!fileName || typeof fileName !== "string" || fileName.includes("..")) {
    return res.status(400).json({ message: "Invalid or missing file name" });
  }

  // Đảm bảo rằng đường dẫn file là an toàn
  const filePath = path.resolve(
    "D:\\downloads\\Git\\FPIC\\FPIC\\backend\\src\\ann",
    fileName + ".json"
  );

  // Kiểm tra xem file có tồn tại không
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not accessible:", filePath); // Thêm log

      return res.status(404).json({ message: "File not found" });
    }

    // Đọc nội dung file JSON
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error reading file", error: err.message });
      }

      try {
        const jsonData = JSON.parse(data);
        res.json({ jsonData });
      } catch (parseErr) {
        res
          .status(500)
          .json({ message: "Error parsing JSON", error: parseErr.message });
      }
    });
  });
});
app.get("/get-classes", (req, res) => {
  // Xác định đường dẫn tới file JSON cố định
  const filePath = path.join(
    "D:\\downloads\\Git\\FPIC\\FPIC\\backend\\src",
    "meta.json"
  );

  // Kiểm tra xem file có tồn tại không
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not accessible:", filePath); // Thêm log
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
app.get("/get-all-data", (req, res) => {
  // Xác định đường dẫn tới thư mục chứa các file JSON
  const directoryPath = path.join(
    "D:\\downloads\\Git\\FPIC\\FPIC\\backend\\src\\ann"
  );

  // Đọc tất cả các tệp trong thư mục
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error reading directory", err });
    }

    // Lọc các tệp JSON
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    // Đọc tất cả các tệp JSON
    const readPromises = jsonFiles.map((file) => {
      return new Promise((resolve, reject) => {
        fs.readFile(path.join(directoryPath, file), "utf8", (err, data) => {
          if (err) {
            return reject(err);
          }
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (parseErr) {
            reject(parseErr);
          }
        });
      });
    });

    // Khi tất cả các tệp JSON đã được đọc xong
    Promise.all(readPromises)
      .then((results) => {
        // Trả về tất cả dữ liệu JSON
        res.json(results);
      })
      .catch((error) => {
        res
          .status(500)
          .json({ message: "Error reading or parsing JSON files", error });
      });
  });
});
app.use("/images", express.static(IMAGES_DIR));

app.listen(9999, () => console.log("Server is running on port 9999"));
