import { Typography, Modal, IconButton, Box, Button, Divider } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useRef, useState } from "react";
import axios from "axios";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import StopIcon from "@mui/icons-material/Stop";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MemoryIcon from '@mui/icons-material/Memory';
import {REACT_APP_URL_PYTHON} from '../config'

const labels_R = [
  "FP", "VIAS", "TP", "LPC", "UP", "JTAG", "SMB", "SPI"
];

// const OCR_CLASSES = ["JTAG", "LPC", "SMB", "SPI"];

function Dashboard() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageUrlsOld, setImageUrlsOld] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [status, setStatus] = useState(false);
  const [statusNew, setStatusNew] = useState(false);
  const [selectLables, setSelectLables] = useState([]);
  const [userNotes, setUserNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showOcrResult, setShowOcrResult] = useState(false);

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleOnChange = (event, value) => {
    setSelectLables(value);
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    setStatus(true);

    const combinedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(combinedFiles);

    const readers = [];
    const newImageUrls = [];
    
    newFiles.forEach((file, index) => {
      const reader = new FileReader();
      readers.push(reader);
      reader.onloadend = () => {
        newImageUrls[index] = reader.result;
        
        if (newImageUrls.filter(Boolean).length === newFiles.length) {
          setImageUrlsOld(prev => [...prev, ...newImageUrls]);
          setStatus(false);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...selectedFiles];
    const newImages = [...imageUrlsOld];
    newFiles.splice(index, 1);
    newImages.splice(index, 1);
    setSelectedFiles(newFiles);
    setImageUrlsOld(newImages);
    
    if (newFiles.length === 0) {
      setProcessedImages([]);
      setCurrentImageIndex(0);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setStatusNew(false);
      console.log("Đã dừng xử lý");
      alert("Bạn muốn dừng kiểm tra!");
    }
  };

  const handleUpload = async () => {
    setStatusNew(true);
    setIsProcessing(true);
    setShowResult(false);
    setShowOcrResult(false);
    
    if (!selectedFiles.length) {
      setStatusNew(false);
      setIsProcessing(false);
      alert("Chưa chọn ảnh nào!");
      return;
    }

    abortControllerRef.current = new AbortController();

    const classesString = selectLables.length === 0 
      ? labels_R.join(',') 
      : selectLables.join(',');

    try {
      const results = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("show_conf", false);
        formData.append("show_labels", true);
        formData.append("show_boxes", true);
        formData.append("line_width", 2);
        formData.append("show_ocr", true);
        formData.append("classes", classesString);

        const response = await axios.post(
          `${REACT_APP_URL_PYTHON}/api/v1/predict-combined`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000,
            signal: abortControllerRef.current.signal
          }
        );

        results.push({
          originalImage: imageUrlsOld[i],
          processedImage: response.data.image,
          appearances: response.data.appearances,
          fileName: file.name
        });
      }

      setProcessedImages(results);
      setCurrentImageIndex(0);
      
      const yoloClasses = ["FP", "VIAS", "TP", "UP"];
      const ocrClasses = ["JTAG", "LPC", "SMB", "SPI"];
      
      const hasYoloResults = yoloClasses.some(
        cls => results[0].appearances[cls] > 0
      );
      
      const hasOcrResults = ocrClasses.some(
        cls => results[0].appearances[cls] > 0
      );
      
      setShowResult(hasYoloResults);
      setShowOcrResult(hasOcrResults);
      
      setStatusNew(false);
      setIsProcessing(false);
      console.log("✅ Hoàn thành kiểm tra");

    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("⚠️ Request đã bị hủy bởi người dùng");
      } else {
        console.error("❌ Lỗi:", error.response ? error.response.data : error.message);
        alert("Lỗi khi nhận diện. Vui lòng kiểm tra lại!");
      }
      setStatusNew(false);
      setIsProcessing(false);
    }
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = () => {
    if (processedImages[currentImageIndex]?.processedImage) {
      const link = document.createElement('a');
      link.href = processedImages[currentImageIndex].processedImage;
      link.download = `PCBimage-predict-${currentImageIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getTotalDetections = () => {
    if (!processedImages[currentImageIndex]) return 0;
    const appearances = processedImages[currentImageIndex].appearances;
    return Object.values(appearances).reduce((sum, count) => sum + count, 0);
  };

  const renderDetectionDetails = () => {
    if (!processedImages[currentImageIndex]) return null;
    const appearances = processedImages[currentImageIndex].appearances;
    
    return Object.entries(appearances)
      .filter(([_, count]) => count > 0)
      .map(([label, count]) => `${label}: ${count}`)
      .join(', ');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, width: '100%', minHeight: '90vh', p: 2 }}>
      {/* Sidebar bên trái */}
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
        // ✅ BỎ pointerEvents: 'none' - chỉ dùng opacity
        opacity: isProcessing ? 0.8 : 1,
        transition: 'opacity 0.3s'
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: 19, mb: 1 }}>
          Chọn loại kiểm tra
        </Typography>
        
        <Autocomplete
          multiple
          disabled={isProcessing}
          sx={{ width: '100%' }}
          id="select-labels"
          options={labels_R}
          onChange={handleOnChange}
          value={selectLables}
          freeSolo={false}
          disableClearable={false}
          filterSelectedOptions
          getOptionLabel={(option) => option}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Loại kiểm tra" 
              placeholder={selectLables.length === 0 ? "Chọn nhiều loại" : ""} 
              size="small" 
            />
          )}
        />
        <Button
          startIcon={<UploadOutlined />}
          disabled={isProcessing}
          sx={{
            background: isProcessing ? '#ccc' : '#3892ee7d', 
            p: '8px 14px', 
            fontSize: '14px', 
            borderRadius:2, 
            fontWeight:'bold', 
            textTransform: 'none',
            '&:disabled': {
              color: '#666'
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
        
        {imageUrlsOld.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 250, overflowY: 'auto', p: 1, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            {imageUrlsOld.map((img, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  position: 'relative', 
                  width: 80, 
                  height: 80, 
                  border: currentImageIndex === idx && processedImages.length > 0 
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
                onClick={() => !isProcessing && processedImages.length > 0 && setCurrentImageIndex(idx)}
              >
                <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt={`Ảnh ${idx+1}`} />
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
        
        {/* ✅ FIX: Nút Dừng với pointerEvents riêng */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
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
              '&:disabled': {
                background: '#ccc'
              }
            }}
            disabled={selectLables.length === 0 || imageUrlsOld.length === 0 || isProcessing}
          >
            {statusNew ? <CircularProgress size={24} color="inherit" /> : 'Kiểm tra'}
          </Button>
          
          {/* ✅ Nút Dừng luôn clickable */}
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
                // ✅ Đảm bảo luôn clickable
                pointerEvents: 'auto',
                zIndex: 10,
                '&:hover': {
                  borderColor: '#b71c1c',
                  background: '#ffebee'
                }
              }}
            >
              Dừng
            </Button>
          )}
        </Box>
      </Box>

      {/* Vùng kết quả phía phải */}
      <Box sx={{ flex: 1, minHeight: 600, bgcolor: '#f8fafd', borderRadius: 3, boxShadow: 2, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        {processedImages.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              <Box sx={{ width: 350, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: 2 }}>
                {statusNew ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>
                      Đang xử lý...
                    </Typography>
                  </Box>
                ) : (
                  <img
                    src={processedImages[currentImageIndex]?.processedImage}
                    alt="Kết quả nhận diện"
                    style={{ maxWidth: '100%', maxHeight: 320, cursor: 'pointer', borderRadius: 8 }}
                    onClick={() => openModal(processedImages[currentImageIndex]?.processedImage)}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 17, color: '#1976d2', mb: 2 }}>
                  Kết quả kiểm tra {processedImages.length > 1 ? `(${currentImageIndex + 1}/${processedImages.length})` : ''}
                </Typography>
                
                <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2.5, mb: 2, boxShadow: 1 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#333', mb: 1.5 }}>
                    📊 Tổng phát hiện: <span style={{color: '#257be2', fontSize: 18}}>{getTotalDetections()}</span> điểm
                  </Typography>
                  
                  <Typography sx={{ fontSize: 14, color: '#555', mb: 2, lineHeight: 1.6 }}>
                    {renderDetectionDetails() || 'Không phát hiện điểm nào'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }}/>
                  
                  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1, color: '#333' }}>
                    Ghi chú:
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    placeholder="Nhập nhận xét của bạn về kết quả kiểm tra..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    sx={{ 
                      bgcolor: '#f9f9f9',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5
                      }
                    }}
                  />
                  
                  <Box sx={{ display:'flex', gap: 2, mt: 2.5 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<DownloadOutlined/>} 
                      onClick={handleDownload}
                      sx={{ fontWeight: 600, color: '#1976d2', borderColor: '#c7dceb', textTransform: 'none' }}
                    >
                      Tải xuống
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      sx={{ fontWeight: 600, bgcolor: '#257be2', textTransform: 'none' }}
                    >
                      Lưu kết quả
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {processedImages.length > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                {processedImages.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: currentImageIndex === idx ? '#257be2' : '#ccc',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'scale(1.2)' }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
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

      <Modal open={isModalOpen} onClose={closeModal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', width: '80vw', height: '85vh', bgcolor: '#000', borderRadius: 3, overflow: 'hidden' }}>
          <IconButton
            onClick={closeModal}
            sx={{ position: 'absolute', top: 15, right: 15, color: 'white', zIndex: 10, bgcolor: '#0003', '&:hover': { bgcolor: '#0005' } }}
          >
            <CloseIcon />
          </IconButton>
          <img src={modalImage} alt="Phóng to" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
      </Modal>
    </Box>
  );
}

export default Dashboard;
