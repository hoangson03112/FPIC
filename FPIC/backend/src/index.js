const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./config/db/index");
const Account = require("./Model/Account");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const axios = require("axios");

const IMAGES_DIR = path.join(__dirname, "img");
const IMAGES_MICROCHIP = path.join(__dirname, "microchip");
const IMAGES_JTAG = path.join(__dirname, "jtag");
const IMAGES_TESTPIN = path.join(__dirname, "testpin");
const IMAGES_LPC = path.join(__dirname, "LPC");

db.connect();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

    const imageCount = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)).length;

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

    const imageCount = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file)).length;

    res.json({ count: imageCount });
  });
});
app.get("/images-jtag", (req, res) => {
  fs.readdir(IMAGES_JTAG, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/jtag/${file}`,
      }));

    res.json(images);
  });
});

app.get("/images-test-pin", (req, res) => {
  fs.readdir(IMAGES_TESTPIN, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/testpin/${file}`,
      }));

    res.json(images);
  });
});

app.get("/images-lpc", (req, res) => {
  fs.readdir(IMAGES_LPC, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/LPC/${file}`,
      }));

    res.json(images);
  });
});

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
    let data = req.body;


    const account = await Account.findOne({ email: data.email });

    if (account) {
      const isMatch = await bcrypt.compare(data.password, account.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Tên người dùng hoặc mật khẩu không đúng" });
      }
      if (account.status === "active") {
        const token = jwt.sign({ _id: account._id }, "sown", {
          expiresIn: "3h",
        });
        return res.json({
          status: "success",
          message: "Login successful",
          token,
        });
      }

      return res
        .status(403)
        .json({ status: "inactive", message: "Tài khoản chưa được kích hoạt" });
    } else {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc email" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Xác thực token
app.get("/authentication", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const data = jwt.verify(token, "sown");
    const account = await Account.findById(data._id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const { password, ...accountResponse } = account.toObject();
    res.json({ status: "success", account: accountResponse });
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
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next(); d
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

app.get('/admin/accounts/count', async (req, res) => {
  const userCount = await Account.countDocuments();
  res.json({ count: userCount });
});



app.listen(9999, () => console.log("Server is running on port 9999"));
