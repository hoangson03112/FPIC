const path = require("path");
const fs = require("fs");
const Microchip = require("../models/Microchip");

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
