import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  name: String,
  filename: String,
  path: String,
  originalname: String,
  size: Number,
  mimetype: String,
  url: String,
  createdAt: { type: Date, default: Date.now },
});

const PDF = mongoose.model("PDF", pdfSchema, "sodokhoi");
