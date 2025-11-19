const mongoose = require("mongoose");

const DetectionResultSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ["fp", "tp", "up", "smb", "spi", "vias", "lpc", "jtag"]
  },
  
  detectionType: {
    type: String,
    required: true
  },
  
  detectionsCount: {
    type: Number,
    default: 0
  },
  
  detections: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  
  originalImage: {
    type: String,
    required: false
  },
  
  annotatedImage: {
    type: String,
    required: false
  },
  
  userNotes: {
    type: String,
    default: ""
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: false
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
  
}, {
  timestamps: true  
});

DetectionResultSchema.index({ type: 1, timestamp: -1 });
DetectionResultSchema.index({ filename: 1 });
DetectionResultSchema.index({ userId: 1 });

const DetectionResult = mongoose.model("DetectionResult", DetectionResultSchema);

module.exports = DetectionResult;
