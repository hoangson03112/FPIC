const path = require("path");
const fs = require("fs");
const Microchip = require("../models/Microchip");
const { log } = require("console");

exports.postMicrochip = async (req, res) => {
  try {
    const { name, description } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newMicrochip = new Microchip({
      name,
      description,
      imagePath: "/microchip/" + req.file.filename,
    });

    await newMicrochip.save();
    res
      .status(201)
      .json({ message: "Microchip created successfully", newMicrochip });
  } catch (error) {
    console.error("Error creating microchip:", error);
    res.status(500).json({ message: "Error creating microchip", error });
  }
};
exports.getMicrochips = async (req, res) => {
  try {
    const microchips = await Microchip.find();
    res
      .status(200)
      .json({ message: "Microchips retrieved successfully", microchips });
  } catch (error) {
    console.error("Error retrieving microchips:", error);
    res.status(500).json({ message: "Error retrieving microchips", error });
  }
};
exports.deleteMicrochip = async (req, res) => {
  try {
    const { id } = req.params;

    const microchip = await Microchip.findByIdAndDelete(id);

    const filePath = path.join(__dirname, "../../", microchip.imagePath);

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
exports.updateMicrochip = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!req.file) {
      await Microchip.findByIdAndUpdate(id, data, {
        new: true,
      });
    }

    // const updateMicrochip = await Microchip.findByIdAndUpdate(id, microchip, {
    //   new: true,
    // });
    // if (updateMicrochip) {
    //   return res.status(200).json({
    //     status: 200,
    //     message: "Cập nhât linh kiện thành công",
    //     data: updateMicrochip,
    //   });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      status: 500,
      message: `Server error: ${error.message}`,
    });
  }
};
