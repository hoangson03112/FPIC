const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const IMAGES_DIR = path.join(__dirname, "img");
const fs = require("fs");

const db = require("./config/db/index");
const Account = require("./Model/Account");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const axios = require("axios");


app.use(cors());
app.use(express.json());
db.connect();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
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
        img1: `/img/${file}`,
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
  axios({
    method: "POST",
    url: "https://detect.roboflow.com/smd-component-detection/12",
    params: {
      api_key: "QjtjIH4aUqUR86fVMcZJ",
    },
    data: image,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error.message);
    });

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

    const account = await Account.findOne({
      email: data.email,
    });

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
      if (account.status === "inactive") {
        return res.json({
          status: "inactive",
          message: "Tài khoản chưa được kích hoạt",
        });
      }
    } else {
      return res.status(401).json({
        status: "login",
        message: "Sai tên đăng nhập hoặc email",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});
app.get("/authentication", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    const data = jwt.verify(token, "sown");
    const account = await Account.findById(data._id);

    if (!account) {
      return res
        .status(404)
        .json({ status: "error", message: "Account not found" });
    }

    // Loại bỏ password khỏi đối tượng account bằng destructuring
    const { password, ...accountResponse } = account.toObject();

    res.json({
      status: "success",
      account: accountResponse,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: "error", message: "Token expired" });
    }
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
});

const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    const data = jwt.verify(token, "sown");
    const account = await Account.findById(data._id);

    if (!account) {
      return res.status(404).json({
        status: "error",
        message: "Account not found.",
      });
    }

    if (account.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You do not have access to this resource.",
      });
    }

    // Lưu trữ account trong res.locals
    res.locals.account = account;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: "error", message: "Token expired" });
    }
    return res.status(401).json({ status: "error", message: "Invalid token" });
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
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get("/admin/accounts", verifyAdmin, async (req, res) => {
  try {
    const accounts = await Account.find({}, "-password");

    if (accounts.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No accounts found" });
    }

    res.json({
      status: "success",
      accounts,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.post("/admin/create-account", verifyToken, async (req, res) => {
  const account = req.body.account;

  try {
    // Kiểm tra xem email đã tồn tại chưa
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
    // Kiểm tra nếu tài khoản tồn tại
    const account = await Account.findById(id);
    if (!account) {
      return res
        .status(404)
        .json({ status: 404, message: "Tài khoản không tồn tại." });
    }

    // Xóa tài khoản
    await Account.findByIdAndDelete(id);

    // Trả về kết quả thành công
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
app.put("/admin/update-account/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const accountUpdated = req.body;
  console.log(id);
  console.log(accountUpdated);

  try {
    // Tìm tài khoản bằng ID và cập nhật thông tin
    const account = await Account.findByIdAndUpdate(
      id,
      { $set: accountUpdated },
      { new: true, runValidators: true } // Trả về tài khoản đã cập nhật và kiểm tra validation
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

app.use("/images", express.static(IMAGES_DIR));

app.listen(9999, () => console.log("Server is running on port 9999"));
