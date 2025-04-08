const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const fs = require("fs");
const db = require("./config/db");
const Account = require("./models/Account");
const SoDoKhoi = require("./models/SoDoKhoi");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const { default: upload } = require("./config/multer/multer");
const bodyParse = require("body-parser");
const AccessoryRouter = require("./routers/AccessoryRouter");
const IMAGES_DIR = path.join(__dirname, "img");
const multer = require("multer");
const uploadWeakPoint = multer({ storage: multer.memoryStorage() });
const IMAGES_MICROCHIP = path.join(__dirname, "../microchip");

const {
  getLPC,
  getTestPin,
  getJTAG,
  getFootPrint,
  getUnusedPort,
  getVias,
  getSPI,
  getSMB,
  postWeakPoint,
} = require("./controller/WeakPointController");
db.connect();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/jtag", express.static("jtag"));
app.use("/testpin", express.static("testpin"));
app.use("/lpc", express.static("lpc"));
app.use("/microchip", express.static("microchip"));
app.use("/footprint", express.static("footprint"));
app.use("/unused_port", express.static("unused_port"));
app.use("/vias", express.static("vias"));
app.use("/spi", express.static("SPI"));
app.use("/smb", express.static("SMB"));

app.use(bodyParse.json());
app.use("/", AccessoryRouter);
app.get("/images", (req, res) => {
  fs.readdir(IMAGES_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error reading directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/images/${file}`,
      }));

    res.json(images);
  });
});
app.get("/images/count", (req, res) => {
  fs.readdir(IMAGES_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error reading directory", err });
    }

    const imageCount = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    ).length;

    res.json({ count: imageCount });
  });
});
app.get("/images-microchip", (req, res) => {
  fs.readdir(IMAGES_MICROCHIP, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/microchip/${file}`,
      }));

    res.json(images);
  });
});
app.get("/images-microchip/count", (req, res) => {
  fs.readdir(IMAGES_MICROCHIP, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error reading directory", err });
    }

    const imageCount = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    ).length;

    res.json({ count: imageCount });
  });
});
app.get("/images-jtag", getJTAG);
app.get("/images-test-pin", getTestPin);
app.get("/images-lpc", getLPC);
app.get("/images-footprint", getFootPrint);
app.get("/images-unused-port", getUnusedPort);
app.get("/images-vias", getVias);
app.get("/images-spi", getSPI);
app.get("/images-smb", getSMB);
app.post("/uploadWeakPoint", uploadWeakPoint.single("image"), postWeakPoint);

app.post("/get-json-file", (req, res) => {
  const { fileName } = req.body;
  const image = fs.readFileSync(
    "D:\\Git\\FPIC\\FPIC\\backend\\src\\img\\" + fileName,
    {
      encoding: "base64",
    }
  );

  const filePath = path.join(
    "D:\\Git\\FPIC\\FPIC\\backend\\src\\ann",
    fileName + ".json"
  );
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "File not found" });
    }

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
  const filePath = path.join(__dirname, "meta.json");

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Error reading file" });
      }

      try {
        const jsonData = JSON.parse(data);
        res.json({ jsonData });
      } catch (error) {
        res.status(500).json({ error: "Error parsing JSON" });
      }
    });
  });
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const account = await Account.findOne({ email });

    if (!account) {
      return res.status(401).json({ message: "Email không tồn tại" }); // Thông báo rõ ràng
    }

    const isMatch = await bcrypt.compare(password, account.password); // ✅ Thêm await
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng" }); // Thông báo riêng
    }

    if (account.status !== "active") {
      return res.status(403).json({
        status: "inactive",
        message: "Tài khoản chưa được kích hoạt",
      });
    }

    // Tạo token nếu mọi thứ hợp lệ
    const token = jwt.sign(
      { _id: account._id, role: account.role },
      "sown" || "temporary_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "3h" }
    );

    return res.json({
      status: "success",
      message: "Đăng nhập thành công",
      token,
    });
  } catch (error) {
    console.error("Login error:", error); // Log lỗi để debug
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});
app.get("/authentication", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const data = jwt.verify(token, "sown");
    const account = await Account.findById(data._id).select("-password");

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ status: "success", account: account });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
});
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const data = jwt.verify(token, "sown");
    const account = await Account.findById(data._id);
    if (!account || account.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    res.locals.account = account;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "sown", (err, user) => {
      // Sửa ở đây
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
app.get("/admin/accounts", verifyAdmin, async (req, res) => {
  try {
    const accounts = await Account.find({}, "-password");
    res.json({ status: "success", accounts });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/admin/create-account", verifyToken, async (req, res) => {
  const account = req.body.account;

  try {
    const existingAccount = await Account.findOne({ email: account.email });
    if (existingAccount) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(account.password, 10);

    const newAccount = new Account({
      ...account,
      password: hashedPassword,
    });
    console.log(newAccount);
    await newAccount.save();
    res
      .status(201)
      .json({ message: "Tài khoản tạo thành công", account: newAccount });
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
app.delete("/admin/delete-account", verifyToken, async (req, res) => {
  const id = req.body.id;
  try {
    const account = await Account.findById(id);
    if (!account) {
      return res
        .status(404)
        .json({ status: 404, message: "Tài khoản không tồn tại." });
    }

    await Account.findByIdAndDelete(id);
    res
      .status(200)
      .json({ status: 200, message: "Tài khoản đã được xóa thành công." });
  } catch (error) {
    console.error("Error deleting account:", error);
    res
      .status(500)
      .json({ status: 500, message: "Có lỗi xảy ra khi xóa tài khoản." });
  }
});
app.put("/admin/update-account/:id", async (req, res) => {
  const { id } = req.params;
  const accountUpdated = req.body;

  try {
    const account = await Account.findByIdAndUpdate(
      id,
      { $set: accountUpdated },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }
    return res.status(200).json({
      message: "Cập nhật tài khoản thành công",
      account,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật tài khoản",
      error: error.message,
    });
  }
});

app.get("/admin/accounts/count", async (req, res) => {
  const userCount = await Account.countDocuments();
  res.json({ count: userCount });
});

const type = require("./routers/TypeAccessoryRouter");
const TypeModel = require("./models/TypeAccessory");
app.use("/", type);

const DIR_TYPE = path.join(__dirname, "public/images");
app.get("/import-types", async (req, res) => {
  try {
    const subfolders = fs
      .readdirSync(DIR_TYPE)
      .filter((folder) =>
        fs.statSync(path.join(DIR_TYPE, folder)).isDirectory()
      );
    const savePromises = subfolders.map(async (folder) => {
      const files = fs
        .readdirSync(path.join(DIR_TYPE, folder))
        .filter(
          (file) =>
            file.endsWith(".png") ||
            file.endsWith("jpg") ||
            file.endsWith("jpeg")
        );

      if (files.length === 0) return null;

      const firstImagePath = `/public/images/${folder}/${files[0]}`;
      const imageBase64 = Buffer.from(firstImagePath).toString("base64");

      const newType = new TypeModel({
        title: folder,
        contentType: "image/png",
        image: imageBase64,
      });

      return await newType.save();
    });

    const results = await Promise.all(savePromises);
    res.json({
      message: `Lưu thành công ${results.filter(Boolean).length} Loại`,
    });
  } catch (error) {
    console.log(`Luwu thất bại: ${error}`);
    res.json({ message: "Lưu thất bại" });
  }
});
const DIR_IMAGE = path.join(__dirname, "public/images/C");
const AccessoryModel = require("./models/Accessory");

app.get("/import-accessories", async (req, res) => {
  try {
    const images = fs
      .readdirSync(DIR_IMAGE)
      .filter(
        (image) =>
          image.endsWith(".png") ||
          image.endsWith(".jpg") ||
          image.endsWith(".jpeg")
      );

    if (images.length === 0) return null;

    const saveAccessories = images.map(async (image) => {
      const accessoryPath = `/public/images/C/${image}`;
      const imageBase64 = Buffer.from(accessoryPath).toString("base64");

      const newAccessory = new AccessoryModel({
        title: image,
        description: "",
        image: imageBase64,
        type: "67bb2d4a9e8b6d1860f8dd4f",
      });
      return await newAccessory.save();
    });

    const results = await Promise.all(saveAccessories);
    res.json({
      message: `Luwu thành công ${results.filter(Boolean).length} file`,
    });
  } catch (error) {
    console.log("Lưu thất bại", error);
    res.json({ message: `Luwu thất bại` });
  }
});

app.get("/fpic/sodokhoi", async (req, res) => {
  try {
    const list = await SoDoKhoi.find(); // Lấy toàn bộ dữ liệu
    res.json(list);
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/fpic/sodokhoi", upload.single("pdf"), async (req, res) => {
  try {
    const { name } = req.body;

    const newSoDoKhoi = new SoDoKhoi({
      name: name,
      filePath: req.file.path,
    });

    await newSoDoKhoi.save();
    res.status(201).json(newSoDoKhoi);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: error.message,
      details: error.stack,
    });
  }
});

app.delete("/fpic/sodokhoi/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem sơ đồ khối có tồn tại không
    const soDoKhoi = await SoDoKhoi.findById(id);
    if (!soDoKhoi) {
      return res.status(404).json({ error: "Sơ đồ khối không tồn tại!" });
    }

    // Xóa file PDF trên server
    const filePath = path.join(process.cwd(), soDoKhoi.filePath); // Lấy đường dẫn đầy đủ của file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Xóa file nếu tồn tại
    }

    // Xóa dữ liệu trong database
    await SoDoKhoi.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa sơ đồ khối thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa sơ đồ khối:", error);
    res.status(500).json({ error: "Lỗi server!", details: error.message });
  }
});

app.put("/fpic/sodokhoi/:id", upload.single("pdf"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const file = req.file;

    // Tìm tài liệu cũ
    const existingFile = await SoDoKhoi.findById(id);
    if (!existingFile) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    // Xóa file cũ nếu có file mới
    if (file && existingFile.filePath) {
      const oldFilePath = path.join(
        "uploads/",
        existingFile.filePath.split("\\").pop().split("/").pop()
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Cập nhật dữ liệu mới
    const updatedSoDoKhoi = await SoDoKhoi.findByIdAndUpdate(
      id,
      {
        name: name || existingFile.name, // Giữ nguyên tên nếu không cập nhật
        filePath: file ? file.path : existingFile.filePath,
      },
      { new: true }
    );

    res.json(updatedSoDoKhoi);
  } catch (error) {
    console.error("Lỗi khi cập nhật sơ đồ khối:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.listen(9999, () => console.log("Server is running on port 9999"));
