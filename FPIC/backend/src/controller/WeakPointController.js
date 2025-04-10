const path = require("path");
const fs = require("fs");
const WeakPoint = require("../models/WeakPoint");
const IMAGES_JTAG = path.join(__dirname, "../../jtag");
const IMAGES_TESTPIN = path.join(__dirname, "../../testpin");
const IMAGES_LPC = path.join(__dirname, "../../LPC");
const IMAGES_FOOTPRINT = path.join(__dirname, "../../footprint");
const IMAGES_UNUSEDPORT = path.join(__dirname, "../../unused_port");
const IMAGES_VIAS = path.join(__dirname, "../../vias");
const IMAGES_SMB = path.join(__dirname, "../../SMB");
const IMAGES_SPI = path.join(__dirname, "../../SPI");

exports.getJTAG = async (req, res) => {
  const listJtag = await WeakPoint.find({ category: "jtag" });
  if (!listJtag) {
    return res.status(404).json({ message: "Không tìm thấy JTAG" });
  }
  res.json(listJtag);
};
exports.getTestPin = async (req, res) => {
  const listTestPin = await WeakPoint.find({ category: "testPin" });
  if (!listTestPin) {
    return res.status(404).json({ message: "Không tìm thấy JTAG" });
  }
  res.json(listTestPin);
};
exports.getLPC = async (req, res) => {
  const listLPC = await WeakPoint.find({ category: "lpc" });
  if (!listLPC) {
    return res.status(404).json({ message: "Không tìm thấy JTAG" });
  }
  res.json(listLPC);
};
exports.getFootPrint = async (req, res) => {
  const listFootPrint = await WeakPoint.find({ category: "footprint" });
  if (!listFootPrint) {
    return res.status(404).json({ message: "Không tìm thấy JTAG" });
  }
  res.json(listFootPrint);
};
exports.getUnusedPort = async (req, res) => {
  const listUnusedPort = await WeakPoint.find({ category: "unusedPort" });
  if (!listUnusedPort) {
    return res.status(404).json({ message: "Không tìm thấy JTAG" });
  }
  res.json(listUnusedPort);
};
exports.getVias = async (req, res) => {
  const listVias = await WeakPoint.find({ category: "vias" });
  if (!listVias) {
    return res.status(404).json({ message: "Không tìm thấy JTAG" });
  }
  res.json(listVias);
};
exports.getSPI = async (req, res) => {
  const listSPI = await WeakPoint.find({ category: "spi" });
  if (!listSPI) {
    return res.status(404).json({ message: "Không tìm thấy SPI" });
  }
  res.json(listSPI);
};
exports.getSMB = async (req, res) => {
  const listSMB = await WeakPoint.find({ category: "smb" });
  if (!listSMB) {
    return res.status(404).json({ message: "Không tìm thấy SPI" });
  }
  res.json(listSMB);
};

exports.postWeakPoint = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const file = req.file;

    if (!file || !category || !name) {
      return res.status(400).json({ error: "Thiếu file, category hoặc name" });
    }

    // Tạo thư mục lưu trữ nếu chưa có
    const folderPath = path.join(__dirname, "../../", category);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Xử lý tên file
    const fileExt = path.extname(file.originalname);
    let finalName = `${name.replace(/\s+/g, "-")}-${Date.now()}${fileExt}`;
    let filePath = path.join(folderPath, finalName);

    // Kiểm tra nếu file đã tồn tại (mặc dù rất khó xảy ra với timestamp)
    let counter = 1;
    while (fs.existsSync(filePath)) {
      finalName = `${name.replace(
        /\s+/g,
        "-"
      )}-${Date.now()}-${counter}${fileExt}`;
      filePath = path.join(folderPath, finalName);
      counter++;
    }

    // Lưu file vào thư mục
    fs.writeFileSync(filePath, file.buffer);

    // Tạo đường dẫn ảnh để lưu vào DB
    const imagePath = `/${category}/${finalName}`;

    // Tạo và lưu document vào MongoDB
    const newWeakPoint = new WeakPoint({
      name,
      description,
      imagePath,
      category,
    });

    await newWeakPoint.save();

    res.status(201).json({
      message: "Upload thành công",
      newWeakPoint,
    });
  } catch (error) {
    console.error("Error uploading weak point:", error);
    res.status(500).json({
      status: 500,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.deleteWeakPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const weakPoint = await WeakPoint.findByIdAndDelete(id);
    const filePath = path.join(__dirname, "../../", weakPoint.imagePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "Xóa thành công" });
    } else {
      res.status(404).json({ message: "File không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.updateWeakPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const file = req.file;

    // Kiểm tra ID hợp lệ
    if (!id) {
      return res.status(400).json({ message: "Thiếu ID WeakPoint" });
    }

    // Tìm WeakPoint hiện tại
    const weakPoint = await WeakPoint.findById(id);
    if (!weakPoint) {
      return res.status(404).json({ message: "Không tìm thấy WeakPoint" });
    }

    // Cập nhật thông tin cơ bản nếu không có file ảnh mới
    if (!file) {
      const updatedWeakPoint = await WeakPoint.findByIdAndUpdate(
        id,
        { name, description },
        { new: true }
      );
      return res.status(200).json({
        message: "Cập nhật thành công (không có thay đổi ảnh)",
        weakPoint: updatedWeakPoint,
      });
    }

    // Xử lý khi có file ảnh mới
    const category = weakPoint.category;
    const folderPath = path.join(__dirname, "../../", category);

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Xóa file cũ nếu tồn tại
    const oldFilePath = path.join(
      __dirname,
      "../../public",
      weakPoint.imagePath
    );
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    // Tạo tên file mới
    const fileExt = path.extname(file.originalname);
    let finalName = `${name.replace(/\s+/g, "-")}-${Date.now()}${fileExt}`;
    let filePath = path.join(folderPath, finalName);

    // Đảm bảo tên file là duy nhất
    let counter = 1;
    while (fs.existsSync(filePath)) {
      finalName = `${name.replace(
        /\s+/g,
        "-"
      )}-${Date.now()}-${counter}${fileExt}`;
      filePath = path.join(folderPath, finalName);
      counter++;
    }

    // Lưu file mới
    fs.writeFileSync(filePath, file.buffer);

    // Cập nhật thông tin trong database
    const imagePath = `/${category}/${finalName}`;
    const updatedWeakPoint = await WeakPoint.findByIdAndUpdate(
      id,
      {
        name,
        description,
        imagePath,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Cập nhật thành công",
      weakPoint: updatedWeakPoint,
    });
  } catch (error) {
    console.error("Error updating weak point:", error);
    res.status(500).json({
      status: 500,
      message: `Server error: ${error.message}`,
    });
  }
};
