const express = require("express");
const router = express.Router();
const DetectionResult = require("../models/DetectionResult");
const { verifyToken, authorize } = require("../middleware/auth");

// POST: Lưu kết quả
router.post(
  "/api/v1/detection-result",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const {
        filename,
        type,
        detectionType,
        detections,
        userNotes,
        originalImage,
        annotatedImage,
        timestamp
      } = req.body;

      if (!filename || !type || !detections) {
        return res.status(400).json({
          message: "Thiếu thông tin bắt buộc"
        });
      }

      const newResult = new DetectionResult({
        filename,
        type: type.toLowerCase(),
        detectionType: detectionType || type,
        detectionsCount: detections.length,
        detections,
        userNotes: userNotes || "",
        originalImage,
        annotatedImage,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userId: req.user?._id || null,
        metadata: {
          userAgent: req.headers["user-agent"],
          ip: req.ip
        }
      });

      await newResult.save();

      res.status(201).json({
        message: "✅ Lưu kết quả thành công!",
        data: {
          _id: newResult._id,
          filename: newResult.filename,
          type: newResult.type,
          detectionsCount: newResult.detectionsCount
        }
      });

    } catch (error) {
      console.error("❌ Lỗi lưu:", error);
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  }
);

// GET: Danh sách kết quả
router.get(
  "/api/v1/detection-results",
  verifyToken,
  authorize(["admin", "assessor"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type } = req.query;
      
      const query = {};
      if (type) query.type = type.toLowerCase();
      
      const skip = (page - 1) * limit;
      
      const results = await DetectionResult
        .find(query)
        .select("-originalImage -annotatedImage")
        .populate("userId", "fullName email")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await DetectionResult.countDocuments(query);
      
      res.json({
        message: "Danh sách kết quả",
        data: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error("❌ Lỗi:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }
);

// GET: Chi tiết
router.get(
  "/api/v1/detection-result/:id",
  verifyToken,
  authorize(["admin", "assessor", "user"]),
  async (req, res) => {
    try {
      const result = await DetectionResult
        .findById(req.params.id)
        .populate("userId", "fullName email");
      
      if (!result) {
        return res.status(404).json({ message: "Không tìm thấy" });
      }
      
      res.json({ message: "Chi tiết", data: result });
      
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
);

// DELETE: Xóa
router.delete(
  "/api/v1/detection-result/:id",
  verifyToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const result = await DetectionResult.findByIdAndDelete(req.params.id);
      
      if (!result) {
        return res.status(404).json({ message: "Không tìm thấy" });
      }
      
      res.json({ message: "✅ Đã xóa" });
      
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
);

// GET: Thống kê
router.get(
  "/api/v1/detection-stats",
  verifyToken,
  authorize(["admin", "assessor"]),
  async (req, res) => {
    try {
      const stats = await DetectionResult.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalDetections: { $sum: "$detectionsCount" },
            avgDetections: { $avg: "$detectionsCount" }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      const total = await DetectionResult.countDocuments();
      
      res.json({
        message: "Thống kê",
        data: { total, byType: stats }
      });
      
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
);

module.exports = router;
