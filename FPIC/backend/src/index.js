const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const fs = require("fs");
const AccessoryModel = require("./models/Accessory");

const db = require("./config/db");
const Account = require("./models/Account");
const SoDoKhoi = require("./models/SoDoKhoi");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const { default: upload } = require("./config/multer/multer");
const { authorize, verifyAdmin, verifyToken } = require("./middleware/auth");
const bodyParse = require("body-parser");
const AccessoryRouter = require("./routers/AccessoryRouter");
const IMAGES_DIR = path.join(__dirname, "img");
const multer = require("multer");
const uploadWeakPoint = multer({ storage: multer.memoryStorage() });
const IMAGES_MICROCHIP = path.join(__dirname, "../microchip");
const { getUserPermissions } = require("./controller/PermissionsController");
const {
  default: uploadMicrochip,
} = require("./config/multer/multerMicrochips");
const TypeModel = require("./models/TypeAccessory");
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
  deleteWeakPoint,
  updateWeakPoint,
  getDashboardDataWeakPoint,
} = require("./controller/WeakPointController");
const {
  postMicrochip,
  getMicrochips,
  deleteMicrochip,
  updateMicrochip,
  getDashboarData,
} = require("./controller/MicrochipController");
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
app.use("/unusedPort", express.static("unusedPort"));
app.use("/vias", express.static("vias"));
app.use("/spi", express.static("SPI"));
app.use("/smb", express.static("SMB"));
app.use("/smb", express.static("SMB"));

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const account = await Account.findOne({ email });

    const permissions = await getUserPermissions(account.role);

    if (!account) {
      return res.status(401).json({ message: "Email không tồn tại" });
    }

    const isMatch = bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    if (account.status !== "active") {
      return res.status(403).json({
        status: "inactive",
        message: "Tài khoản chưa được kích hoạt",
      });
    }

    const token = jwt.sign(
      {
        _id: account._id,
        role: account.role,
      },
      "sown",
      { expiresIn: "12h" }
    );

    return res.json({
      status: "success",
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: account.role,
        permissions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
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

app.use(bodyParse.json());
app.use("/", AccessoryRouter);
app.get(
  "/images",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  (req, res) => {
    fs.readdir(IMAGES_DIR, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error reading directory", err });
      }

      const images = files
        .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map((file) => ({
          name: file,
          img: `/images/${file}`,
        }));

      res.json(images);
    });
  }
);
app.get(
  "/images/count",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  (req, res) => {
    fs.readdir(IMAGES_DIR, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error reading directory", err });
      }

      const imageCount = files.filter((file) =>
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      ).length;

      res.json({ count: imageCount });
    });
  }
);
app.get(
  "/microchips",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getMicrochips
);
app.post(
  "/microchips",
  verifyToken,
  authorize(["admin"]),
  uploadMicrochip.single("image"),
  postMicrochip
);
app.get(
  "/images-microchip/count",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  (req, res) => {
    fs.readdir(IMAGES_MICROCHIP, (err, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error reading directory", err });
      }

      const imageCount = files.filter((file) =>
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      ).length;

      res.json({ count: imageCount });
    });
  }
);
app.delete(
  "/microchips/:id",
  verifyToken,
  authorize(["admin"]),
  deleteMicrochip
);
app.get(
  "/microchips/dashboard-data",
  verifyToken,
  authorize(["admin"]),
  getDashboarData
);
app.get(
  "/weakpoint/dashboard-data",
  verifyToken,
  authorize(["admin"]),
  getDashboardDataWeakPoint
);

app.put(
  "/microchips/:id",
  verifyToken,
  authorize(["admin"]),
  uploadMicrochip.single("image"),
  updateMicrochip
);

app.get(
  "/images-jtag",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getJTAG
);

app.get(
  "/images-test-pin",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getTestPin
);

app.get(
  "/images-lpc",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getLPC
);

app.get(
  "/images-footprint",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getFootPrint
);
app.get(
  "/images-unused-port",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getUnusedPort
);
app.get(
  "/images-vias",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getVias
);
app.get(
  "/images-spi",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getSPI
);
app.get(
  "/images-smb",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  getSMB
);
app.post(
  "/uploadWeakPoint",
  verifyToken,
  authorize(["admin"]),
  uploadWeakPoint.single("image"),
  postWeakPoint
);
app.delete(
  "/deleteWeakPoint/:id",
  verifyToken,
  authorize(["admin"]),
  uploadWeakPoint.single("image"),
  deleteWeakPoint
);
app.put(
  "/updateWeakPoint/:id",
  verifyToken,
  authorize(["admin"]),
  uploadWeakPoint.single("image"),
  updateWeakPoint
);

app.post(
  "/get-json-file",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  (req, res) => {
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
  }
);
app.get(
  "/get-classes",
  verifyToken,
  authorize(["admin", "assessor", "user"]),

  (req, res) => {
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
  }
);

app.get(
  "/admin/accounts",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const accounts = await Account.find({}, "-password");
      res.json({ status: "success", accounts });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.post(
  "/admin/create-account",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
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
  }
);
app.delete(
  "/admin/delete-account",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
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
  }
);
app.put(
  "/admin/update-account/:id",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
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
  }
);

app.get(
  "/admin/accounts/count",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
    const userCount = await Account.countDocuments();
    res.json({ count: userCount });
  }
);

const type = require("./routers/TypeAccessoryRouter");
const Microchip = require("./models/Microchip");
const WeakPoint = require("./models/WeakPoint");
app.use("/", verifyToken, authorize(["admin", "assessor", "user"]), type);

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

app.get(
  "/import-accessories",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
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
  }
);

// ==================== IMPORT IMAGES BATCH WITH WEAKPOINT ====================
// Mapping giữa tên thư mục và category để tự động nhận diện
const FOLDER_CATEGORY_MAPPING = {
  'jtag': 'jtag',
  'testpin': 'testPin', 
  'test-pin': 'testPin',
  'lpc': 'lpc',
  'footprint': 'footprint',
  'unusedport': 'unusedPort',
  'unused-port': 'unusedPort',
  'up': 'unusedPort',  // Mapping cho "up" → "unusedPort"
  'vias': 'vias',
  'spi': 'spi',
  'smb': 'smb'
};

// Hàm tự động nhận diện category từ tên thư mục
function detectCategoryFromFolder(folderName) {
  const normalizedName = folderName.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Bỏ ký tự đặc biệt
    .replace(/\s+/g, ''); // Bỏ khoảng trắng
  
  // Tìm kiếm exact match trước
  if (FOLDER_CATEGORY_MAPPING[normalizedName]) {
    return FOLDER_CATEGORY_MAPPING[normalizedName];
  }
  
  // Tìm kiếm partial match
  for (const [key, category] of Object.entries(FOLDER_CATEGORY_MAPPING)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return category;
    }
  }
  
  return null; // Không tìm thấy
}

// Endpoint import ảnh hàng loạt với tự động nhận diện category
app.post(
  "/import-images-batch-weakpoint",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { 
        sourceFolder, 
        customCategory = null,
        namePrefix = "UP mẫu",
        device = "" // Default là chuỗi rỗng, không bắt buộc
      } = req.body;
      
      if (!sourceFolder) {
        return res.status(400).json({ 
          message: "Vui lòng cung cấp đường dẫn thư mục nguồn" 
        });
      }

      // Kiểm tra thư mục có tồn tại không (hỗ trợ đường dẫn tuyệt đối)
      if (!fs.existsSync(sourceFolder)) {
        return res.status(404).json({ 
          message: "Thư mục không tồn tại",
          providedPath: sourceFolder
        });
      }

      // Tự động nhận diện category từ tên thư mục
      const folderName = path.basename(sourceFolder);
      let detectedCategory = detectCategoryFromFolder(folderName);
      
      // Ưu tiên customCategory nếu được cung cấp
      const finalCategory = customCategory || detectedCategory;
      
      if (!finalCategory) {
        return res.status(400).json({ 
          message: `Không thể nhận diện hạng mục từ thư mục "${folderName}". Vui lòng cung cấp customCategory.`,
          availableCategories: Object.values(FOLDER_CATEGORY_MAPPING)
        });
      }

      // Đọc tất cả file ảnh từ thư mục nguồn
      const images = fs
        .readdirSync(sourceFolder)
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.jfif'].includes(ext);
        })
        .sort(); // Sắp xếp để đảm bảo thứ tự nhất quán

      if (images.length === 0) {
        return res.status(404).json({ 
          message: "Không tìm thấy file ảnh nào trong thư mục" 
        });
      }

      // Tạo thư mục đích nếu chưa có (trong thư mục gốc backend)
      const targetDir = path.join(__dirname, "../", finalCategory);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Import từng ảnh với tên mới theo thứ tự
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < images.length; i++) {
        try {
          const originalFile = path.join(sourceFolder, images[i]);
          const fileExt = path.extname(images[i]);
          const newFileName = `${namePrefix} ${i + 1}${fileExt}`; // Bỏ timestamp
          const targetFile = path.join(targetDir, newFileName);
          
          // Kiểm tra file gốc có tồn tại không
          if (!fs.existsSync(originalFile)) {
            throw new Error(`File gốc không tồn tại: ${originalFile}`);
          }
          
          // Copy file với tên mới
          fs.copyFileSync(originalFile, targetFile);
          
          // Kiểm tra file đã được copy thành công
          if (!fs.existsSync(targetFile)) {
            throw new Error(`Không thể copy file: ${targetFile}`);
          }
          
          // Tạo đường dẫn cho database
          const imagePath = `/${finalCategory}/${newFileName}`;

          // Lưu vào database WeakPoint
          const newWeakPoint = new WeakPoint({
            name: `${namePrefix} ${i + 1}`,
            description: "", // Để trống như yêu cầu
            imagePath: imagePath,
            category: finalCategory,
            device: device || ""
          });

          await newWeakPoint.save();
          results.push({
            original: images[i],
            newName: newFileName,
            category: finalCategory,
            device: device || "Không xác định",
            success: true
          });
          successCount++;
          
        } catch (error) {
          console.error(`Lỗi khi xử lý ${images[i]}:`, error);
          results.push({
            original: images[i],
            error: error.message,
            success: false
          });
          errorCount++;
        }
      }

      res.json({
        message: `Import hoàn thành! Thành công: ${successCount}, Lỗi: ${errorCount}`,
        folderName: folderName,
        sourcePath: sourceFolder,
        detectedCategory: detectedCategory,
        finalCategory: finalCategory,
        device: device || "Không xác định",
        total: images.length,
        success: successCount,
        errors: errorCount,
        results: results
      });

    } catch (error) {
      console.error("Lỗi import:", error);
      res.status(500).json({ 
        message: `Lỗi server: ${error.message}` 
      });
    }
  }
);

// Endpoint để xem danh sách thư mục có ảnh và gợi ý category
app.get(
  "/scan-folders-with-images",
  verifyToken,
  authorize(["admin"]),
  (req, res) => {
    try {
      const { rootPath = "C:\\" } = req.query;
      
      const scanDirectory = (dir, maxDepth = 3, currentDepth = 0) => {
        if (currentDepth >= maxDepth) return [];
        
        const items = [];
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          entries.forEach(entry => {
            if (entry.isDirectory()) {
              const fullPath = path.join(dir, entry.name);
              const hasImages = fs.readdirSync(fullPath).some(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.jfif'].includes(ext);
              });
              
              if (hasImages) {
                const detectedCategory = detectCategoryFromFolder(entry.name);
                items.push({
                  name: entry.name,
                  path: fullPath,
                  detectedCategory: detectedCategory,
                  imageCount: fs.readdirSync(fullPath).filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.jfif'].includes(ext);
                  }).length
                });
              }
              
              // Đệ quy tìm trong thư mục con
              items.push(...scanDirectory(fullPath, maxDepth, currentDepth + 1));
            }
          });
        } catch (err) {
          // Bỏ qua thư mục không thể đọc
        }
        
        return items;
      };

      const foldersWithImages = scanDirectory(rootPath);
      
      res.json({
        message: `Danh sách thư mục có ảnh trong ${rootPath}`,
        total: foldersWithImages.length,
        folders: foldersWithImages,
        availableCategories: Object.values(FOLDER_CATEGORY_MAPPING)
      });
      
    } catch (error) {
      res.status(500).json({ 
        message: `Lỗi quét thư mục: ${error.message}` 
      });
    }
  }
);

// Endpoint để xem mapping category hiện tại
app.get(
  "/category-mapping",
  verifyToken,
  authorize(["admin"]),
  (req, res) => {
    res.json({
      message: "Mapping giữa tên thư mục và category",
      mapping: FOLDER_CATEGORY_MAPPING,
      availableCategories: Object.values(FOLDER_CATEGORY_MAPPING)
    });
  }
);

// Endpoint để xóa tất cả WeakPoint theo category
app.delete(
  "/clear-weakpoints-by-category/:category",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { category } = req.params;
      
      // Lấy danh sách WeakPoint để xóa files
      const weakPoints = await WeakPoint.find({ category });
      
      // Xóa files trong thư mục (trong thư mục gốc backend)
      const targetDir = path.join(__dirname, "../", category);
      if (fs.existsSync(targetDir)) {
        const files = fs.readdirSync(targetDir);
        files.forEach(file => {
          const filePath = path.join(targetDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error(`Lỗi xóa file ${file}:`, error);
          }
        });
      }
      
      // Xóa records trong database
      const result = await WeakPoint.deleteMany({ category });
      
      res.json({
        message: `Đã xóa ${result.deletedCount} records và files trong category ${category}`,
        deletedCount: result.deletedCount,
        category: category
      });
    } catch (error) {
      console.error("Lỗi xóa category:", error);
      res.status(500).json({ 
        message: `Lỗi xóa category: ${error.message}` 
      });
    }
  }
);

app.get(
  "/fpic/sodokhoi",
  verifyToken,
  authorize(["admin", "assessor", "user"]),

  async (req, res) => {
    try {
      const list = await SoDoKhoi.find();
      res.json(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.post(
  "/fpic/sodokhoi",
  upload.single("pdf"),
  verifyToken,
  authorize(["admin"]),

  async (req, res) => {
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
  }
);

app.delete(
  "/fpic/sodokhoi/:id",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
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
  }
);

app.put(
  "/fpic/sodokhoi/:id",
  verifyToken,
  authorize(["admin"]),
  upload.single("pdf"),
  async (req, res) => {
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
  }
);
app.get("/stats", verifyToken, authorize(["admin"]), async (req, res) => {
  try {
    const [
      typeNumber,
      accessoryNumber,
      microchipNumber,
      soDoKhoiNumber,
      weakPointNumber,
      accountNumber,
    ] = await Promise.all([
      TypeModel.countDocuments(),
      AccessoryModel.countDocuments(),
      Microchip.countDocuments(),
      SoDoKhoi.countDocuments(),
      WeakPoint.countDocuments(),
      Account.countDocuments(),
    ]);

    res.json({
      types: typeNumber,
      accessories: accessoryNumber,
      microchips: microchipNumber,
      soDoKhois: soDoKhoiNumber,
      weakPoints: weakPointNumber,
      accounts: accountNumber,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê" });
  }
});

app.listen(9999, () => console.log("Server is running on port 9999"));
