const path = require("path");
const fs = require("fs");
const IMAGES_JTAG = path.join(__dirname, "../../jtag");
const IMAGES_TESTPIN = path.join(__dirname, "../../testpin");
const IMAGES_LPC = path.join(__dirname, "../../LPC");
const IMAGES_FOOTPRINT = path.join(__dirname, "../../footprint");

const IMAGES_UNUSEDPORT = path.join(__dirname, "../../unused_port");
const IMAGES_VIAS = path.join(__dirname, "../../vias");
const IMAGES_SMB = path.join(__dirname, "../../smb");
const IMAGES_SPI = path.join(__dirname, "../../spi");

exports.getJTAG = async (req, res) => {
  fs.readdir(IMAGES_JTAG, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) =>
        /\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|tif|jfif|heic|ico)$/i.test(file)
      )
      .map((file) => ({
        name: file,
        img: `/jtag/${file}`,
      }));

    res.json(images);
  });
};
exports.getTestPin = async (req, res) => {
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
};
exports.getLPC = async (req, res) => {
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
};
exports.getFootPrint = async (req, res) => {
  fs.readdir(IMAGES_FOOTPRINT, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/footprint/${file}`,
      }));

    res.json(images);
  });
};
exports.getUnusedPort = async (req, res) => {
  fs.readdir(IMAGES_UNUSEDPORT, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/unused_port/${file}`,
      }));

    res.json(images);
  });
};
exports.getVias = async (req, res) => {
  fs.readdir(IMAGES_VIAS, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/vias/${file}`,
      }));

    res.json(images);
  });
};
exports.getSPI = async (req, res) => {
  fs.readdir(IMAGES_SPI, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/spi/${file}`,
      }));

    res.json(images);
  });
};
exports.getSMB = async (req, res) => {
  fs.readdir(IMAGES_SMB, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading microchip directory", err });
    }

    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        name: file,
        img: `/smb/${file}`,
      }));

    res.json(images);
  });
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

    const fileExt = path.extname(file.originalname);
    let finalName = name + fileExt;
    let filePath = path.join(folderPath, finalName);

    if (fs.existsSync(filePath)) {
      const timestamp = Date.now();
      finalName = `${name}-${timestamp}${fileExt}`;
      filePath = path.join(folderPath, finalName);
    }

    fs.writeFileSync(filePath, file.buffer);

    res.json({
      message: "Upload thành công",
      fileName: finalName,
      filePath,
      name,
      description,
      category,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: `Server error: ${error.message}`,
    });
  }
};
