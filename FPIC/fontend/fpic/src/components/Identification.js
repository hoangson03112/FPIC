import { 
  Typography, Modal, IconButton, Box, Button, Divider, 
  LinearProgress, Card
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import { UploadOutlined, DownloadOutlined, SendOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import StopIcon from "@mui/icons-material/Stop";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MemoryIcon from '@mui/icons-material/Memory';
import Alert from '@mui/material/Alert';
import { REACT_APP_URL_PYTHON, REACT_APP_URL_BE } from '../config';

const labels_R = ["FP", "VIAS", "TP", "LPC", "UP", "JTAG", "SMB", "SPI"];

const STORAGE_KEYS = {
  IMAGE_URLS: 'dashboard_image_urls',
  PROCESSED_RESULTS: 'dashboard_processed_results',
  SELECT_LABEL: 'dashboard_select_label',
  USER_NOTES: 'dashboard_user_notes',
  CURRENT_IMAGE_INDEX: 'dashboard_current_image_index'
};

function Dashboard() {
  // State management
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageUrlsOld, setImageUrlsOld] = useState([]);
  const [processedResults, setProcessedResults] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [status, setStatus] = useState(false);
  const [statusNew, setStatusNew] = useState(false);
  const [selectLabel, setSelectLabel] = useState("");
  const [userNotes, setUserNotes] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isSendingResults, setIsSendingResults] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ===== LOCAL STORAGE LOGIC =====
  useEffect(() => {
    try {
      const savedImageUrls = sessionStorage.getItem(STORAGE_KEYS.IMAGE_URLS);
      const savedProcessedResults = localStorage.getItem(STORAGE_KEYS.PROCESSED_RESULTS);
      const savedSelectLabel = localStorage.getItem(STORAGE_KEYS.SELECT_LABEL);
      const savedUserNotes = localStorage.getItem(STORAGE_KEYS.USER_NOTES);
      const savedCurrentImageIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_IMAGE_INDEX);

      if (savedImageUrls) {
        try {
          setImageUrlsOld(JSON.parse(savedImageUrls));
          console.log("✅ Đã restore images từ sessionStorage");
        } catch (e) {
          console.warn("Không thể parse image urls");
        }
      }

      if (savedProcessedResults) {
        try {
          setProcessedResults(JSON.parse(savedProcessedResults));
          console.log("✅ Đã restore processed results");
        } catch (e) {
          console.warn("Không thể parse processed results");
        }
      }

      if (savedSelectLabel) {
        setSelectLabel(savedSelectLabel);
      }

      if (savedUserNotes) {
        try {
          setUserNotes(JSON.parse(savedUserNotes));
        } catch (e) {
          console.warn("Không thể parse user notes");
        }
      }

      if (savedCurrentImageIndex) {
        setCurrentImageIndex(JSON.parse(savedCurrentImageIndex));
      }

      console.log("✅ Load data from storage complete");
    } catch (error) {
      console.error("Lỗi khi load storage:", error);
    }
  }, []);

  // ✅ Save imageUrls vào sessionStorage
  useEffect(() => {
    if (imageUrlsOld.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.IMAGE_URLS, JSON.stringify(imageUrlsOld));
        console.log(`✅ Saved ${imageUrlsOld.length} images to sessionStorage`);
      } catch (error) {
        console.error("Lỗi save image urls:", error);
      }
    }
  }, [imageUrlsOld]);

  useEffect(() => {
    if (processedResults.length > 0) {
      try {
        const lightweightResults = processedResults.map(result => ({
          filename: result.filename,
          type: result.type,
          detections: result.detections,
          cropDetails: result.cropDetails,
          texts: result.texts,
        }));

        const sizeEstimate = new Blob([JSON.stringify(lightweightResults)]).size;
        
        if (sizeEstimate < 4 * 1024 * 1024) {
          localStorage.setItem(STORAGE_KEYS.PROCESSED_RESULTS, JSON.stringify(lightweightResults));
        }
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.error("localStorage đầy");
          localStorage.clear();
        }
      }
    }
  }, [processedResults]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECT_LABEL, selectLabel);
    } catch (error) {
      console.error("Lỗi save select label:", error);
    }
  }, [selectLabel]);

  useEffect(() => {
    try {
      const sizeEstimate = new Blob([JSON.stringify(userNotes)]).size;
      if (sizeEstimate < 1 * 1024 * 1024) {
        localStorage.setItem(STORAGE_KEYS.USER_NOTES, JSON.stringify(userNotes));
      }
    } catch (error) {
      console.error("Lỗi save notes:", error);
    }
  }, [userNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_IMAGE_INDEX, JSON.stringify(currentImageIndex));
    } catch (error) {
      console.error("Lỗi save index:", error);
    }
  }, [currentImageIndex]);

  // ===== SUBMIT RESULTS TO BACKEND =====
  const handleSendResults = useCallback(async () => {
    if (processedResults.length === 0) {
      setError("Chưa có kết quả để gửi!");
      return;
    }

    setIsSendingResults(true);
    setError(null);

    try {
      const submitData = processedResults.map((result, idx) => ({
        filename: result.filename,
        type: result.type,
        detections: result.detections,
        cropDetails: result.cropDetails,
        texts: result.texts,
        userNotes: userNotes[idx] || "",
        originalImage: imageUrlsOld[idx],
        annotatedImage: result.annotatedImage,
        crops: result.crops,
        timestamp: new Date().toISOString()
      }));

      const response = await axios.post(
        `${REACT_APP_URL_BE}/api/v1/detection-results`, // Thay đổi endpoint theo BE của bạn
        {
          results: submitData,
          detectionType: selectLabel,
          totalResults: processedResults.length,
          submittedAt: new Date().toISOString()
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000
        }
      );

      setSuccessMessage("✅ Đã gửi kết quả kiểm tra thành công!");
      console.log("✅ Response from backend:", response.data);

      // Clear data sau khi gửi thành công
      setTimeout(() => {
        clearAllData();
        setSuccessMessage(null);
      }, 2000);

    } catch (error) {
      if (error.response) {
        setError(`Lỗi: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        setError("Không thể kết nối đến server BE. Vui lòng kiểm tra URL.");
      } else {
        setError(`Lỗi: ${error.message}`);
      }
      console.error("❌ Lỗi gửi kết quả:", error);
    } finally {
      setIsSendingResults(false);
    }
  }, [processedResults, imageUrlsOld, selectLabel, userNotes]);

  const clearAllData = useCallback(() => {
    if (window.confirm("Xóa tất cả dữ liệu và bắt đầu lại?")) {
      try {
        localStorage.clear();
        sessionStorage.clear(); // ✅ Clear sessionStorage khi xóa data
      } catch (error) {
        console.error("Lỗi clear storage:", error);
      }
      setSelectedFiles([]);
      setImageUrlsOld([]);
      setProcessedResults([]);
      setCurrentImageIndex(0);
      setSelectLabel("");
      setUserNotes({});
      setError(null);
      console.log("✅ Tất cả dữ liệu đã được xóa");
    }
  }, []);

  // ===== HANDLERS =====
  const handleOnChange = useCallback((event, value) => {
    setSelectLabel(value);
    setError(null);
  }, []);

  const handleFileChange = useCallback((event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        setError(`File ${file.name} không phải là ảnh hợp lệ`);
      }
      return isImage;
    });

    if (validFiles.length === 0) return;

    setStatus(true);
    setError(null);

    const combinedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(combinedFiles);

    const readers = [];
    const newImageUrls = [];
    
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      readers.push(reader);
      reader.onloadend = () => {
        newImageUrls[index] = reader.result;
        
        if (newImageUrls.filter(Boolean).length === validFiles.length) {
          setImageUrlsOld(prev => [...prev, ...newImageUrls]);
          setStatus(false);
        }
      };
      reader.onerror = () => {
        setError(`Lỗi đọc file ${file.name}`);
        setStatus(false);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFiles]);

  const handleRemoveImage = useCallback((index) => {
    const newFiles = [...selectedFiles];
    const newImages = [...imageUrlsOld];
    newFiles.splice(index, 1);
    newImages.splice(index, 1);
    setSelectedFiles(newFiles);
    setImageUrlsOld(newImages);
    
    if (newFiles.length === 0) {
      setProcessedResults([]);
      setCurrentImageIndex(0);
      setError(null);
    }
  }, [selectedFiles, imageUrlsOld]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsProcessing(false);
      setStatusNew(false);
      setError("Đã hủy quá trình kiểm tra");
    }
  }, []);

  const handleUpload = useCallback(async () => {
    setStatusNew(true);
    setIsProcessing(true);
    setError(null);
    
    if (!selectedFiles.length) {
      setStatusNew(false);
      setIsProcessing(false);
      setError("Chưa chọn ảnh nào!");
      return;
    }

    if (!selectLabel) {
      setStatusNew(false);
      setIsProcessing(false);
      setError("Vui lòng chọn loại kiểm tra!");
      return;
    }

    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
      
      formData.append("target_type", selectLabel.toLowerCase());

      const response = await axios.post(
        `${REACT_APP_URL_PYTHON}/api/predict`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000,
          signal: abortControllerRef.current.signal
        }
      );

      const results = response.data.results || [];
      
      if (results.length === 0) {
        setError("Không nhận được kết quả từ server");
        setStatusNew(false);
        setIsProcessing(false);
        return;
      }

      const formattedResults = results.map((result, idx) => ({
        filename: result.filename,
        type: result.type,
        originalImage: imageUrlsOld[idx],
        annotatedImage: result.annotated_image,
        detections: result.detections || [],
        crops: result.crops || [],
        cropDetails: result.crop_details || [],
        pageOcr: result.page_ocr || [],
        texts: result.texts || [],
        resultImages: result.result_images || [],
      }));

      setProcessedResults(formattedResults);
      setCurrentImageIndex(0);
      
      const newNotes = {};
      formattedResults.forEach((_, idx) => {
        newNotes[idx] = userNotes[idx] || "";
      });
      setUserNotes(newNotes);
      
      setStatusNew(false);
      setIsProcessing(false);
      console.log("✅ Hoàn thành kiểm tra");

    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        setError("Đã hủy quá trình kiểm tra");
      } else if (error.code === 'ECONNABORTED') {
        setError("Timeout! Vui lòng kiểm tra kết nối mạng.");
      } else if (error.response) {
        setError(`Lỗi server: ${error.response.data.detail || error.response.statusText}`);
      } else if (error.request) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra URL Python API.");
      } else {
        setError(`Lỗi: ${error.message}`);
      }
      console.error("❌ Lỗi:", error);
      setStatusNew(false);
      setIsProcessing(false);
    }
  }, [selectedFiles, imageUrlsOld, selectLabel, userNotes]);

  const handleUploadButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const openModal = useCallback((imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const currentResult = useMemo(() => 
    processedResults[currentImageIndex] || null, 
    [processedResults, currentImageIndex]
  );

  const getTotalDetections = useMemo(() => {
    if (!currentResult?.detections) return 0;
    return currentResult.detections.length;
  }, [currentResult]);

  const isUploadDisabled = useMemo(() => {
    return !selectLabel || imageUrlsOld.length === 0 || isProcessing;
  }, [selectLabel, imageUrlsOld, isProcessing]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, width: '100%', minHeight: '90vh', p: 2 }}>
      {/* ===== SIDEBAR BÊN TRÁI ===== */}
      <Box sx={{ 
        width: 340, 
        minHeight: 600, 
        bgcolor: '#fff', 
        borderRadius: 3, 
        boxShadow: 3, 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: 19, mb: 1 }}>
          Chọn loại kiểm tra
        </Typography>
        
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 1 }}>
            {successMessage}
          </Alert>
        )}
        
        <Autocomplete
          disabled={isProcessing}
          sx={{ width: '100%' }}
          options={labels_R}
          onChange={handleOnChange}
          value={selectLabel}
          freeSolo={false}
          getOptionLabel={(option) => option}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Loại kiểm tra" 
              placeholder="Chọn một loại" 
              size="small"
              disabled={isProcessing}
            />
          )}
        />

        <Button
          startIcon={<UploadOutlined />}
          disabled={isProcessing}
          sx={{
            background: '#3892ee7d', 
            p: '8px 14px', 
            fontSize: '14px', 
            borderRadius: 2, 
            fontWeight: 'bold', 
            textTransform: 'none',
            color: '#000',
            '&:disabled': { 
              background: '#ccc',
              color: '#666'
            },
            '&:hover': { 
              background: '#257be2',
              color: '#fff'
            }
          }}
          onClick={handleUploadButtonClick}
        >
          Thêm ảnh ({imageUrlsOld.length})
        </Button>

        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        
        {status && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography sx={{ fontSize: 13 }}>Đang tải ảnh...</Typography>
          </Box>
        )}
        
        {imageUrlsOld.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            maxHeight: 250, 
            overflowY: 'auto', 
            p: 1, 
            bgcolor: '#f5f5f5', 
            borderRadius: 2,
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { background: '#257be2', borderRadius: '4px' }
          }}>
            {imageUrlsOld.map((img, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  position: 'relative', 
                  width: 80, 
                  height: 80, 
                  border: currentImageIndex === idx && processedResults.length > 0 
                    ? '2.5px solid #257be2' 
                    : '1.5px solid #3892ee44', 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  boxShadow: 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isProcessing ? 0.5 : 1,
                  '&:hover': isProcessing ? {} : { boxShadow: 3, transform: 'scale(1.05)' }
                }}
                onClick={() => !isProcessing && processedResults.length > 0 && setCurrentImageIndex(idx)}
              >
                <img 
                  src={img} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                  alt={`Ảnh ${idx+1}`}
                  loading="lazy"
                />
                <IconButton 
                  size="small"
                  disabled={isProcessing}
                  sx={{ 
                    position: 'absolute', 
                    top: 2, 
                    right: 2, 
                    background: '#fffc', 
                    p: 0.3,
                    '&:hover': { background: '#fff' },
                    '&:disabled': { background: '#ddd', opacity: 0.5 }
                  }} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (!isProcessing) handleRemoveImage(idx); 
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 2, 
                    left: 2, 
                    background: '#000a', 
                    color: '#fff', 
                    px: 0.5, 
                    py: 0.2,
                    fontSize: 11, 
                    borderRadius: 0.5,
                    fontWeight: 600
                  }}
                >
                  {idx + 1}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ 
              flex: 1,
              fontWeight: 600, 
              fontSize: 15, 
              p: '9px 0', 
              borderRadius: 2, 
              boxShadow: 2, 
              background: '#257be2', 
              textTransform: 'none',
              '&:disabled': { background: '#ccc' },
              '&:hover': { background: '#1565c0' }
            }}
            disabled={isUploadDisabled}
          >
            {statusNew ? <CircularProgress size={24} color="inherit" /> : 'Kiểm tra'}
          </Button>
          
          {isProcessing && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleStop}
              startIcon={<StopIcon />}
              sx={{ 
                fontWeight: 600, 
                fontSize: 15, 
                p: '9px 16px', 
                borderRadius: 2,
                textTransform: 'none',
                borderColor: '#d32f2f',
                color: '#d32f2f',
                pointerEvents: 'auto',
                zIndex: 10,
                '&:hover': { borderColor: '#b71c1c', background: '#ffebee' }
              }}
            >
              Dừng
            </Button>
          )}
        </Box>

        {statusNew && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}

        <Button
          size="small"
          onClick={clearAllData}
          sx={{ textTransform: 'none', color: '#d32f2f' }}
        >
          Xóa tất cả dữ liệu
        </Button>
      </Box>

      {/* ===== VÙNG KẾT QUẢ PHÍA PHẢI ===== */}
      <Box sx={{ 
        flex: 1, 
        minHeight: 600, 
        bgcolor: '#f8fafd', 
        borderRadius: 3, 
        boxShadow: 2, 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '10px' },
        '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb': { background: '#257be2', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: '#1565c0' }
      }}>
        {statusNew && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={60} />
            <Typography sx={{ fontSize: 16, color: '#666', mt: 2 }}>
              Đang xử lý...
            </Typography>
          </Box>
        )}

        {!statusNew && processedResults.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header + Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 'bold', fontSize: 18, color: '#1976d2', mb: 1 }}>
                  📋 Kết quả kiểm tra ({processedResults.length} ảnh)
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#666' }}>
                  Loại: <strong>{selectLabel}</strong> | Tổng cộng: <strong>{processedResults.length}</strong> ảnh
                </Typography>
              </Box>

              {/* ✅ BUTTON GỬI ĐÁNH GIÁ */}
              <Button
                variant="contained"
                startIcon={<SendOutlined />}
                onClick={handleSendResults}
                disabled={isSendingResults || processedResults.length === 0}
                sx={{
                  background: '#4caf50',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: 14,
                  p: '8px 20px',
                  borderRadius: 2,
                  '&:hover': { background: '#388e3c' },
                  '&:disabled': { background: '#ccc' }
                }}
              >
                {isSendingResults ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </Button>
            </Box>

            {/* Results Cards */}
            {processedResults.map((result, idx) => (
              <Card 
                key={idx}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  boxShadow: 1,
                  border: currentImageIndex === idx ? '2px solid #257be2' : '1px solid #e0e0e0',
                  transition: 'all 0.3s',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.8 : 1,
                  '&:hover': {
                    boxShadow: 3,
                    border: '2px solid #257be2'
                  }
                }}
                onClick={() => !isProcessing && setCurrentImageIndex(idx)}
              >
                {/* Result Header */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    flexShrink: 0,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={result.annotatedImage}
                      alt={`Kết quả ${idx + 1}`}
                      style={{ maxWidth: '100%', maxHeight: '100%', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(result.annotatedImage);
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 1 }}>
                      📁 {result.filename}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#666', mb: 1 }}>
                      📊 Phát hiện: <span style={{ color: '#257be2', fontWeight: 600 }}>{result.detections.length}</span> điểm
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#999' }}>
                      Loại: {result.type.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Detections */}
                {result.detections.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333', mb: 1 }}>
                      Chi tiết phát hiện:
                    </Typography>
                    {result.detections.map((det, detIdx) => (
                      <Box 
                        key={detIdx} 
                        sx={{ 
                          p: 1, 
                          mb: 0.5,
                          bgcolor: '#f9f9f9', 
                          borderRadius: 1,
                          borderLeft: '3px solid #257be2'
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                          {det.class_name} - Confidence: {(det.confidence * 100).toFixed(1)}%
                        </Typography>
                        {det.ocr?.best_text && (
                          <Typography sx={{ fontSize: 11, color: '#666', mt: 0.3 }}>
                            OCR: {det.ocr.best_text}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
                    <Typography sx={{ fontSize: 12, color: '#999' }}>
                      Không phát hiện điểm nào
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Crops */}
                {result.crops && result.crops.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333', mb: 1 }}>
                      🔍 Crops ({result.crops.length})
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      overflowX: 'auto',
                      p: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      '&::-webkit-scrollbar': { height: '6px' },
                      '&::-webkit-scrollbar-thumb': { background: '#257be2', borderRadius: '3px' }
                    }}>
                      {result.crops.map((crop, cropIdx) => (
                        <Box
                          key={cropIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(crop);
                          }}
                          sx={{
                            width: 50,
                            height: 50,
                            flexShrink: 0,
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                        >
                          <img
                            src={crop}
                            alt={`Crop ${cropIdx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Notes */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333', mb: 1 }}>
                    Ghi chú:
                  </Typography>
                  <TextField
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    placeholder="Nhập ý kiến về kết quả này..."
                    value={userNotes[idx] || ""}
                    onChange={(e) => {
                      setUserNotes(prev => ({
                        ...prev,
                        [idx]: e.target.value
                      }));
                    }}
                    disabled={isProcessing || isSendingResults}
                    sx={{ 
                      bgcolor: '#f9f9f9',
                      '& .MuiOutlinedInput-root': { borderRadius: 1 }
                    }}
                  />
                </Box>

                {/* Download Button */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = result.annotatedImage;
                    link.download = `PCB-${result.filename || `image-${idx + 1}`}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  disabled={isProcessing || isSendingResults}
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1976d2', 
                    borderColor: '#c7dceb', 
                    textTransform: 'none',
                    fontSize: 12,
                    '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' },
                    '&:disabled': { color: '#ccc', borderColor: '#eee' }
                  }}
                >
                  Tải ảnh
                </Button>
              </Card>
            ))}
          </Box>
        ) : !statusNew && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#999' 
          }}>
            <MemoryIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
            <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
              Chưa có kết quả kiểm tra
            </Typography>
            <Typography sx={{ fontSize: 14, mt: 1 }}>
              Vui lòng chọn ảnh và nhấn "Kiểm tra"
            </Typography>
          </Box>
        )}
      </Box>

      {/* ===== MODAL ===== */}
      <Modal 
        open={isModalOpen} 
        onClose={closeModal} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          position: 'relative', 
          width: '80vw', 
          height: '85vh', 
          bgcolor: '#000', 
          borderRadius: 3, 
          overflow: 'hidden' 
        }}>
          <IconButton
            onClick={closeModal}
            sx={{ 
              position: 'absolute', 
              top: 15, 
              right: 15, 
              color: 'white', 
              zIndex: 10, 
              bgcolor: '#0003', 
              '&:hover': { bgcolor: '#0005' } 
            }}
          >
            <CloseIcon />
          </IconButton>
          <img 
            src={modalImage} 
            alt="Phóng to" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </Box>
      </Modal>
    </Box>
  );
}

export default React.memo(Dashboard);
