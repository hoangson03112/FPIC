import { Typography, Modal, IconButton, Box, Button, Table, TableBody, TableCell, TableRow, TableHead, Paper, TableContainer } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Input } from "@mui/material";
import React, { useRef, useState } from "react";
import axios from "axios";
import { CheckCircleOutlined, ZoomInOutlined, RightSquareOutlined, UploadOutlined, ZoomOutOutlined, UnorderedListOutlined, DownloadOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MenuIcon from '@mui/icons-material/Menu';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {REACT_APP_URL_PYTHON} from '../config'

const labels_R = [
  "FP", "VIAS", "TP", "LPC", "UP", "JTAG", "SMB", "SPI", "WP"
];

const labels = [
  { symbol: "FP", description: "Footprint" },
  { symbol: "VIAS", description: "Vias" },
  { symbol: "TP", description: "Test Point" },
  { symbol: "UP", description: "Unused Port" }
];

const ocr_lables = [
  { symbol: "LPC", description: "LPC" },
  { symbol: "JTAG", description: "Joint Test Action Group" },
  { symbol: "SMB", description: "SM Bus" },
  { symbol: "SPI", description: "SPI Bus" }
];

// ✅ Danh sách các label cần dùng OCR
const OCR_CLASSES = ["JTAG", "LPC", "SMB", "SPI"];

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlOld, setImageUrlOld] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [status, setStatus] = useState(false);
  const [statusNew, setStatusNew] = useState(false);
  const [size, setSize] = useState(49);
  const [contLabel, setCountLabel] = useState();
  const [selectLables, setSelectLables] = useState([]);
  const [open, setOpen] = useState(false);
  const [icList, setIcList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowStates, setRowStates] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showOcrResult, setShowOcrResult] = useState(false);
  
  // ✅ State để quản lý hiển thị button
  const [showPredictBtn, setShowPredictBtn] = useState(false);

  const fileInputRef = useRef(null);

  // ✅ Cải tiến hàm handleOnChange
  const handleOnChange = (event, value) => {
    // Kiểm tra xem có chứa OCR class không
    const hasOcrClass = value.some(v => OCR_CLASSES.includes(v));
    
    if (value.length > 0) {
      setShowPredictBtn(true);
    } else {
      setShowPredictBtn(false);
    }
    
    setSelectLables(value);
  };

  const handleFileChange = (event) => {
    setStatus(true);
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrlOld(reader.result);
      setStatus(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      setImageUrlOld(null);
    }
  };

  const handleUpload = async () => {
    setStatusNew(true);
    setShowResult(false);
    setShowOcrResult(false);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("show_conf", false);
    formData.append("show_labels", true);
    formData.append("show_boxes", true);
    formData.append("line_width", 2);
    formData.append("show_ocr", true);
    
    // ✅ Chuyển đổi mảng thành chuỗi
    const classesString = selectLables.length === 0 
      ? labels_R.join(',') 
      : selectLables.join(',');
    
    formData.append("classes", classesString);

    try {
      console.log("Đang gửi request với classes:", classesString);
      
      const response = await axios.post(
        `${REACT_APP_URL_PYTHON}/api/v1/predict-combined`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000 
        }
      );

      console.log("Nhận được response:", response.data);

      setImageUrl(response.data.image);
      setCountLabel(response.data.appearances);
      
      // ✅ Xác định loại kết quả để hiển thị
      const yoloClasses = ["FP", "VIAS", "TP", "UP"];
      const ocrClasses = ["JTAG", "LPC", "SMB", "SPI"];
      
      const hasYoloResults = yoloClasses.some(
        cls => response.data.appearances[cls] > 0
      );
      
      const hasOcrResults = ocrClasses.some(
        cls => response.data.appearances[cls] > 0
      );
      
      setShowResult(hasYoloResults);
      setShowOcrResult(hasOcrResults);
      
      setStatusNew(false);
      
      console.log("✅ Nhận diện thành công");

    } catch (error) {
      console.error("❌ Lỗi:", error.response ? error.response.data : error.message);
      setStatusNew(false);
      alert("Lỗi khi nhận diện. Vui lòng kiểm tra lại!");
    }
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'PCBimage-predict.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadJS = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `${REACT_APP_URL_PYTHON}/api/v1/predict`, 
        formData, 
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'PCB-predict-bb.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Lỗi khi tải file JSON:', error);
    }
  };

  const fetchCroppedImages = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `${REACT_APP_URL_PYTHON}/api/v1/crop-u-ocr`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      const croppedImages = response.data.cropped_images_with_ocr.map((item, index) => ({
        id: index + 1,
        name: `IC ${index + 1}`,
        description: 'Cropped image of IC component',
        imageSrc: item.cropped_image,
        ocrData: item.ocr_data
      }));

      setIcList(croppedImages);
    } catch (error) {
      console.error('Lỗi khi lấy ảnh cropped:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
    fetchCroppedImages();
  };

  const handleClose = () => {
    setOpen(false);
    setIcList([]);
  };

  const handleCheckClick = (id) => {
    setRowStates((prevState) => ({
      ...prevState,
      [id]: { isLoading: true },
    }));

    setTimeout(() => {
      setRowStates((prevState) => ({
        ...prevState,
        [id]: { isVerified: true },
      }));

      setTimeout(() => {
        setRowStates((prevState) => ({
          ...prevState,
          [id]: {},
        }));
      }, 30000);
    }, 30000);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <MemoryIcon sx={{ fontSize: 40, color: '#1976d2' }} />
        <p>Phát hiện điểm yếu</p>
      </Box>

      <Box sx={{ marginBottom: "10px", display: "flex", flexDirection: "row", gap: "10px", alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: "flex", gap: "10px", alignItems: "center", flex: 1 }}>
          <Button
            startIcon={<UploadOutlined />}
            sx={{ background: '#3892ee7d', padding: '6px 12px', fontSize: '12px' }}
            size="small"
            onClick={handleUploadButtonClick}
          >
            Chọn ảnh
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {imageUrlOld && (
            <>
              {/* ✅ Hiển thị button dựa trên state */}
              {showPredictBtn && (
                <Button
                  startIcon={<RightSquareOutlined />}
                  sx={{ background: "#3892ee7d", padding: '6px 12px', fontSize: '12px' }}
                  size="small"
                  onClick={handleUpload}
                >
                  Nhận diện
                </Button>
              )}

              <Autocomplete
                multiple
                sx={{
                  width: '25%',
                  marginLeft: '20px',
                  '& .MuiOutlinedInput-root': {
                    padding: '5px 10px',
                    borderRadius: '8px',
                    borderColor: '#3892ee',
                    '&:hover': {
                      borderColor: '#2a73d3',
                    },
                  },
                  '& .MuiChip-root': {
                    backgroundColor: '#f5f5f5',
                    fontSize: '0.85rem',
                    color: '#333',
                    '& .MuiChip-deleteIcon': {
                      color: '#888',
                    },
                  },
                  '& .MuiAutocomplete-clearIndicator': {
                    color: '#666',
                  },
                  '& .MuiAutocomplete-popupIndicator': {
                    color: '#3892ee',
                  },
                }}
                id="tags-outlined"
                options={labels_R}
                onChange={handleOnChange}
                defaultValue={[]}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn nhãn"
                    placeholder="Có thể chọn nhiều nhãn"
                    size="small"
                    sx={{
                      '& label.Mui-focused': {
                        color: '#3892ee',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#3892ee',
                        },
                        '&:hover fieldset': {
                          borderColor: '#2a73d3',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1a5bbd',
                        },
                      },
                    }}
                  />
                )}
              />
            </>
          )}
        </Box>

        {imageUrl && (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '10px' }}>
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button 
                startIcon={<UnorderedListOutlined />} 
                sx={{ background: "#3892ee7d", fontSize: '12px', padding: '6px 12px' }} 
                size="small" 
                onClick={handleOpen}
              >
                Danh sách IC
              </Button>
              <Button 
                startIcon={<DownloadOutlined />} 
                sx={{ background: '#3892ee7d', padding: '6px 12px', fontSize: '12px' }} 
                size="small" 
                onClick={handleDownload}
              >
                Tải ảnh
              </Button>
              <Button 
                startIcon={<DownloadOutlined />} 
                sx={{ background: '#3892ee7d', padding: '6px 12px', fontSize: '12px' }} 
                size="small" 
                onClick={() => handleDownloadJS(selectedFile)}
              >
                Tải JSON
              </Button>

              {/* Modal danh sách IC */}
              <Modal
                open={open}
                onClose={handleClose}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box sx={{ position: 'relative', width: '60%', maxHeight: '70%', overflowY: 'auto', bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                  <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <CloseIcon />
                  </IconButton>

                  <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>
                    DANH SÁCH IC NHẬN DIỆN
                  </Typography>

                  {loading ? (
                    <Box sx={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead style={{ display: 'table-header-group' }}>
                          <TableRow>
                            <TableCell align="center"><strong>ID</strong></TableCell>
                            <TableCell align="center"><strong>Image</strong></TableCell>
                            <TableCell align="center"><strong>Text</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {icList.map((ic) => (
                            <TableRow key={ic.id}>
                              <TableCell align="center" style={{ verticalAlign: 'middle' }}>{ic.id}</TableCell>
                              <TableCell align="center" style={{ verticalAlign: 'middle' }}>
                                <img
                                  src={ic.imageSrc}
                                  alt={ic.name}
                                  style={{ width: '100px', height: '120px', objectFit: 'contain' }}
                                />
                              </TableCell>
                              <TableCell align="left" style={{ verticalAlign: 'middle' }}>
                                {ic.ocrData.length > 0 ? (
                                  <ul>
                                    {ic.ocrData.map((ocrItem, ocrIndex) => (
                                      <li key={ocrIndex}>
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                          {ocrItem.text}
                                        </Typography>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>Không có dữ liệu OCR</Typography>
                                )}
                              </TableCell>
                              <TableCell align="center" style={{ verticalAlign: 'middle' }}>
                                {rowStates[ic.id]?.isLoading ? (
                                  <CircularProgress size={24} />
                                ) : rowStates[ic.id]?.isVerified ? (
                                  <Box display="flex" alignItems="center" justifyContent="center">
                                    <CheckCircleOutlined style={{ fontSize: '24px', color: 'green', marginRight: '8px' }} />
                                    <Typography sx={{ color: 'green' }}>IC tin cậy</Typography>
                                  </Box>
                                ) : (
                                  <Button
                                    onClick={() => handleCheckClick(ic.id)}
                                    sx={{ background: "#3892ee7d", padding: '6px 12px', fontSize: '12px' }}
                                    size="small"
                                  >
                                    kiểm tra
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Modal>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
        {status ? (
          <Box sx={{ width: `${size}%`, overflow: "hidden", margin: "auto", display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: `${size}%`, overflow: "hidden" }}>
            {imageUrlOld && (
              <img
                src={imageUrlOld}
                alt="ảnh ban đầu"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", cursor: "pointer" }}
                onClick={() => openModal(imageUrlOld)}
              />
            )}
          </Box>
        )}

        {statusNew ? (
          <Box sx={{ width: `${98 - size}%`, overflow: "hidden", margin: "auto", display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: `${98 - size}%`, overflow: "hidden", display: 'flex' }}>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Predicted"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", cursor: "pointer" }}
                onClick={() => openModal(imageUrl)}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Modal hiển thị ảnh phóng to */}
      <Modal open={isModalOpen} onClose={closeModal} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <IconButton
            onClick={closeModal}
            sx={{ position: "absolute", top: "10px", right: "10px", color: "white", zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <img src={modalImage} alt="Phóng to" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
      </Modal>

      {/* Kết quả nhận diện YOLO */}
      {imageUrl && showResult && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <CheckCircleOutlinedIcon sx={{ color: 'green', fontSize: '40px' }} />
            <p>Kết quả nhận diện bằng mô hình</p>
          </Box>
          <Box sx={{ marginTop: "5px", display: "flex" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
              {labels.map((label, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                    marginBottom: "10px",
                    padding: "2px 10px",
                    border: "1px solid #ccc",
                    backgroundColor: "#dcd6d6",
                    borderRadius: "8px"
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      marginRight: "5px"
                    }}
                  >
                    {label.symbol}
                    <span
                      style={{
                        fontWeight: "300",
                        fontSize: "12px",
                        marginRight: "2px"
                      }}
                    >
                      ({label.description}):
                    </span>
                    {contLabel ? contLabel[label.symbol] : ""}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Kết quả nhận diện OCR */}
      {showOcrResult && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <CheckCircleOutlinedIcon sx={{ color: 'green', fontSize: '40px' }} />
            <p>Kết quả nhận diện bằng OCR</p>
          </Box>
          <Box sx={{ marginTop: "5px", display: "flex" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
              {ocr_lables.map((label, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                    marginBottom: "10px",
                    padding: "2px 10px",
                    border: "1px solid #ccc",
                    backgroundColor: "#dcd6d6",
                    borderRadius: "8px"
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      marginRight: "5px"
                    }}
                  >
                    {label.symbol}
                    <span
                      style={{
                        fontWeight: "300",
                        fontSize: "12px",
                        marginRight: "2px"
                      }}
                    >
                      ({label.description}):
                    </span>
                    {contLabel ? contLabel[label.symbol] : ""}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

export default Dashboard;
