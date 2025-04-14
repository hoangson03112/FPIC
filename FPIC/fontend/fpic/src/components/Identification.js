// Material Dashboard 2 React example components
import {
  Typography,
  Modal,
  IconButton,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  TableContainer,
  alpha,
  useTheme,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { Input } from "@mui/material";
import React, { useRef, useState } from "react";
import axios from "axios";
import {
  CheckCircleOutlined,
  ZoomInOutlined,
  RightSquareOutlined,
  UploadOutlined,
  ZoomOutOutlined,
  UnorderedListOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MenuIcon from "@mui/icons-material/Menu";
import MemoryIcon from "@mui/icons-material/Memory";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Memory } from "@mui/icons-material";

// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

// const labels_R = [
//   "R", "C", "U", "Q", "J", "L", "RA", "D", "RN", "TP", "IC", "P", "CR",
//   "M", "BTN", "FB", "CRA", "SW", "T", "F", "V", "LED", "S", "QA", "JP","LPC","JTAG"
// ];
const labels_R = ["FP", "VIAS", "TP", "JTAG", "LPC"];

// const labels = [
//   { symbol: "R", description: "Resistor" },
//   { symbol: "C", description: "Capacitor" },
//   { symbol: "U", description: "Integrated Circuit" },
//   { symbol: "Q", description: "Discrete Transistor" },
//   { symbol: "J", description: "Connector" },
//   { symbol: "L", description: "Inductor" },
//   { symbol: "RA", description: "Resistor Coil" },
//   { symbol: "D", description: "Diode" },
//   { symbol: "RN", description: "Resistor Network" },
//   { symbol: "TP", description: "Test Point" },
//   { symbol: "IC", description: "Integrated Circuit" },
//   { symbol: "P", description: "Plug" },
//   { symbol: "CR", description: "Thyristor" },
//   { symbol: "M", description: "Motor" },
//   { symbol: "BTN", description: "Button" },
//   { symbol: "FB", description: "Ferrite Bead" },
//   { symbol: "CRA", description: "CRA" },
//   { symbol: "SW", description: "Switch" },
//   { symbol: "T", description: "Transformer" },
//   { symbol: "F", description: "Fuse" },
//   { symbol: "V", description: "Vaccum Tube" },
//   { symbol: "LED", description: "Light Emitting Diode" },
//   { symbol: "S", description: "Switch" },
//   { symbol: "QA", description: "QA" },
//   { symbol: "JP", description: "Jumper Link" },
//   { symbol: "LPC", description: "Low Pin Count" },
//   { symbol: "JTAG", description: "Joint Test Action Group" },
// ];

const labels = [
  { symbol: "FP", description: "Footprint" },
  { symbol: "VIAS", description: "Vias" },
  { symbol: "TP", description: "Test Point" },
];

const Identification = () => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlOld, setImageUrlOld] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [status, setStatus] = useState(false);
  const [statusNew, setStatusNew] = useState(false);
  const [size, setSize] = useState(49);
  const [contLabel, setCountLabel] = useState();
  const [selectLables, setSelectLables] = useState(labels_R);
  const [open, setOpen] = useState(false);
  const [icList, setIcList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [icChecked, setICChecked] = useState(false);
  const [rowStates, setRowStates] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [countJtag, setCountJtag] = useState(0);

  const handleOnChange = (event, value) => {
    if (value[0] === "JTAG" || value[0] === "LPC") {
      const btn = document.querySelector(".predictBtn");
      const ocrBtn = document.querySelector(".predictOcrBtn");
      if (btn) {
        btn.style.display = "none";
      }
      if (ocrBtn) {
        ocrBtn.style.display = "flex";
      }
      setSelectLables(value);
    } else if (value[0] !== "JTAG" && value[0] !== "LPC" && value[0]) {
      const btn = document.querySelector(".predictOcrBtn");
      const predictBtn = document.querySelector(".predictBtn");
      if (btn) {
        btn.style.display = "none";
      }
      if (predictBtn) {
        predictBtn.style.display = "flex";
      }
      setSelectLables(value);
    } else {
      const btn = document.querySelector(".predictOcrBtn");
      const predictBtn = document.querySelector(".predictBtn");
      if (btn) {
        btn.style.display = "none";
      }
      if (predictBtn) {
        predictBtn.style.display = "none";
      }
      setSelectLables(value);
    }
  };
  const handleGetCount = async (formData) => {
    try {
      const result = await axios.post(
        "http://localhost:8000/api/v1/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // console.log('result?.data?.appearances:', result?.data?.appearances)
      setCountLabel(result?.data?.appearances);
      setShowResult(true);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };
  const fileInputRef = useRef(null);
  const handleFileChange = (event) => {
    setStatus(true);
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrlOld(reader.result); // Ảnh đã chọn
      setStatus(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      setImageUrlOld(null);
    }
  };
  const handleUpload = () => {
    setStatusNew(true);
    setShowResult(false);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("img_size", 1280);
    formData.append("show_conf", false);
    formData.append("show_labels", true);
    formData.append("show_boxes", true);
    formData.append(
      "classes",
      selectLables.length === 0 ? labels_R : selectLables
    );
    handleGetCount(formData);

    axios
      .post("http://localhost:8000/api/v1/predict-png", formData, {
        responseType: "arraybuffer",
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        setImageUrl(`data:image/png;base64,${base64}`);
        setStatusNew(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleUploadocr = () => {
    setShowResult(false);
    setStatusNew(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    axios
      .post("http://localhost:8000/api/v1/predict-ocr", formData, {
        responseType: "arraybuffer", // To handle the binary response (image)
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // Convert the binary data to base64
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        // Set the image URL to display it in the frontend
        setImageUrl(`data:image/png;base64,${base64}`);
        setStatusNew(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  // Hàm để mở file dialog khi bấm button
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger click vào input file
    }
  };
  const handleDownload = () => {
    // Kiểm tra nếu URL hình ảnh đã tồn tại
    if (imageUrl) {
      // Tạo một thẻ link (a) để kích hoạt việc tải xuống
      const link = document.createElement("a");
      link.href = imageUrl; // Đường dẫn hình ảnh base64 đã được thiết lập
      link.download = "PCBimage-predict.png"; // Tên file mà bạn muốn lưu
      document.body.appendChild(link);
      link.click(); // Kích hoạt việc tải xuống
      document.body.removeChild(link); // Xóa thẻ link sau khi hoàn thành
    }
  };
  const handleDownloadJS = async (selectedFile) => {
    // Thêm selectedFile như tham số
    try {
      const formData = new FormData();
      formData.append("file", selectedFile); // Gửi tệp hình ảnh

      const response = await axios.post(
        "http://localhost:8000/api/v1/predict",
        formData,
        {
          responseType: "blob", // Để nhận dữ liệu dưới dạng blob
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Tạo một đối tượng URL từ blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Tạo thẻ a để tải tệp
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "PCB-predict-bb.json"); // Tên tệp khi tải về

      // Thêm thẻ a vào document và kích hoạt click
      document.body.appendChild(link);
      link.click();

      // Xóa thẻ a sau khi tải xong
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the JSON file:", error);
    }
  };

  const fetchCroppedImages = async () => {
    try {
      setLoading(true); // Set loading to true before API call
      const formData = new FormData();
      formData.append("file", selectedFile); // 'selectedFile' là file ảnh bạn muốn gửi lên

      const response = await axios.post(
        "http://localhost:8000/api/v1/crop-u-ocr",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Tạo danh sách dữ liệu IC từ phản hồi, bao gồm cả ảnh và kết quả OCR
      const croppedImages = response.data.cropped_images_with_ocr.map(
        (item, index) => ({
          id: index + 1,
          name: `IC ${index + 1}`,
          description: "Cropped image of IC component",
          imageSrc: item.cropped_image, // Đường dẫn base64 của ảnh
          ocrData: item.ocr_data, // Dữ liệu OCR (văn bản và confidence)
        })
      );

      setIcList(croppedImages); // Set the IC list with cropped images
    } catch (error) {
      console.error("Error fetching cropped images:", error);
    } finally {
      setLoading(false); // Always set loading to false after the API call
    }
  };

  const openModal = (imageSrc) => {
    setModalImage(imageSrc); // Đặt ảnh vào modal
    setIsModalOpen(true); // Mở modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Đóng modal
  };
  // Gọi API khi bấm mở danh sách IC
  const handleOpen = () => {
    setOpen(true); // Open modal
    fetchCroppedImages(); // Gọi API lấy dữ liệu
  };

  const handleClose = () => {
    setOpen(false); // Close modal
    setIcList([]); // Clear IC list on modal close if necessary
  };

  const customTexts = {
    1: "431ADQ30LF1 REV:1H\nH05A095000794\nM1M35",
    2: "UTC\nUZI084L\n3JATD0A",
    3: "FNA0SS\n4SS",
    4: " ",
    5: "APL1117\nPI40433",
    6: "APL1117GHC8V18",
    7: "TPA6011\n62T\nCVYV",
    // Thêm các nội dung khác nếu cần
  };
  const [verified, setVerified] = useState(false);

  const handleCheckClick = (id) => {
    // Đặt trạng thái loading cho hàng được chọn
    setRowStates((prevState) => ({
      ...prevState,
      [id]: { isLoading: true },
    }));

    // Hiển thị "Đang kiểm tra" trong 3 giây, sau đó hiển thị "IC tin cậy"
    setTimeout(() => {
      setRowStates((prevState) => ({
        ...prevState,
        [id]: { isVerified: true },
      }));

      // Sau 2 giây, quay lại hiển thị nút "Kiểm tra"
      setTimeout(() => {
        setRowStates((prevState) => ({
          ...prevState,
          [id]: {},
        }));
      }, 3000);
    }, 3000);
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(120deg, ${
            theme.palette.primary.main
          }, ${alpha(theme.palette.primary.light, 0.8)})`,
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Memory sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Nhận diện điểm yếu
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          marginBottom: "10px",
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* First Row: Button for selecting image */}
        <Box
          sx={{ display: "flex", gap: "10px", alignItems: "center", flex: 1 }}
        >
          <Button
            startIcon={<UploadOutlined />}
            sx={{
              background: "#3892ee7d",
              padding: "6px 12px",
              fontSize: "12px",
            }}
            size="small"
            onClick={handleUploadButtonClick} // Open file dialog
          >
            Chọn ảnh
          </Button>
          <input
            type="file"
            ref={fileInputRef} // Reference to input
            style={{ display: "none" }} // Hide input
            onChange={handleFileChange} // File selected
          />

          {/* Nhận diện button */}
          {imageUrlOld && (
            <>
              <Button
                className="predictBtn"
                startIcon={<RightSquareOutlined />}
                sx={{
                  background: "#3892ee7d",
                  padding: "6px 12px",
                  fontSize: "12px",
                  display: "none",
                }}
                size="small"
                onClick={handleUpload}
              >
                Nhận diện
              </Button>
              <Button
                className="predictOcrBtn"
                startIcon={<RightSquareOutlined />}
                sx={{
                  background: "#3892ee7d",
                  padding: "6px 12px",
                  fontSize: "12px",
                  display: "none",
                }}
                size="small"
                onClick={handleUploadocr}
              >
                Nhận diện OCR
              </Button>

              {/* Autocomplete for selecting labels */}
              <Autocomplete
                multiple
                sx={{
                  width: "25%", // Tăng chiều rộng để dễ nhìn hơn
                  marginLeft: "20px",
                  "& .MuiOutlinedInput-root": {
                    padding: "5px 10px", // Thêm padding bên trong input
                    borderRadius: "8px", // Bo góc cho đẹp hơn
                    borderColor: "#3892ee", // Đổi màu viền
                    "&:hover": {
                      borderColor: "#2a73d3", // Đổi màu viền khi rê chuột
                    },
                  },
                  "& .MuiChip-root": {
                    backgroundColor: "#f5f5f5", // Màu nền sáng cho các chip đã chọn
                    fontSize: "0.85rem", // Giảm kích thước font của chip
                    color: "#333", // Màu chữ tối hơn
                    "& .MuiChip-deleteIcon": {
                      color: "#888", // Màu biểu tượng xóa trên chip
                    },
                  },
                  "& .MuiAutocomplete-clearIndicator": {
                    color: "#666", // Màu nút xóa nội dung
                  },
                  "& .MuiAutocomplete-popupIndicator": {
                    color: "#3892ee", // Màu của mũi tên dropdown
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
                      "& label.Mui-focused": {
                        color: "#3892ee", // Đổi màu label khi focus
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#3892ee", // Màu viền mặc định
                        },
                        "&:hover fieldset": {
                          borderColor: "#2a73d3", // Màu viền khi hover
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1a5bbd", // Màu viền khi focus
                        },
                      },
                    }}
                  />
                )}
              />
            </>
          )}
        </Box>

        {/* Second Row: Display buttons and prediction result after image upload */}
        {imageUrl && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {/* Button row */}
            <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* Danh sách IC button */}
              <Button
                startIcon={<UnorderedListOutlined />}
                sx={{
                  background: "#3892ee7d",
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
                size="small"
                onClick={handleOpen}
              >
                Danh sách IC
              </Button>
              <Button
                startIcon={<DownloadOutlined />}
                sx={{
                  background: "#3892ee7d",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
                size="small"
                onClick={handleDownload}
              >
                Tải ảnh
              </Button>
              <Button
                startIcon={<DownloadOutlined />}
                sx={{
                  background: "#3892ee7d",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
                size="small"
                onClick={() => handleDownloadJS(selectedFile)}
              >
                Tải JSON
              </Button>

              {/* Modal for IC list */}
              <Modal
                open={open}
                onClose={handleClose}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "60%",
                    maxHeight: "70%",
                    overflowY: "auto",
                    bgcolor: "background.paper",
                    p: 4,
                    borderRadius: 2,
                  }}
                >
                  {/* Close Button */}
                  <IconButton
                    onClick={handleClose}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>

                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ marginBottom: 2 }}
                  >
                    DANH SÁCH IC NHẬN DIỆN
                  </Typography>

                  {/* Loading Spinner */}
                  {loading ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: "300px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead style={{ display: "table-header-group" }}>
                          <TableRow>
                            <TableCell align="center">
                              <strong>ID</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Image</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Text</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Actions</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {icList.map((ic) => (
                            <TableRow key={ic.id}>
                              <TableCell
                                align="center"
                                style={{ verticalAlign: "middle" }}
                              >
                                {ic.id}
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ verticalAlign: "middle" }}
                              >
                                <img
                                  src={ic.imageSrc}
                                  alt={ic.name}
                                  style={{
                                    width: "100px",
                                    height: "120px",
                                    objectFit: "contain",
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                align="left"
                                style={{ verticalAlign: "middle" }}
                              >
                                {ic.ocrData.length > 0 ? (
                                  <ul>
                                    {ic.ocrData.map((ocrItem, ocrIndex) => (
                                      <li key={ocrIndex}>
                                        <Typography
                                          sx={{ whiteSpace: "pre-wrap" }}
                                        >
                                          {ocrItem.text}
                                        </Typography>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                    Không có dữ liệu OCR
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell
                                align="center"
                                style={{ verticalAlign: "middle" }}
                              >
                                {/* Kiểm tra trạng thái của hàng */}
                                {rowStates[ic.id]?.isLoading ? (
                                  <CircularProgress size={24} />
                                ) : rowStates[ic.id]?.isVerified ? (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <CheckCircleOutlined
                                      style={{
                                        fontSize: "24px",
                                        color: "green",
                                        marginRight: "8px",
                                      }}
                                    />
                                    <Typography sx={{ color: "green" }}>
                                      IC tin cậy
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Button
                                    onClick={() => handleCheckClick(ic.id)}
                                    sx={{
                                      background: "#3892ee7d",
                                      padding: "6px 12px",
                                      fontSize: "12px",
                                    }}
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

      <Box
        sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}
      >
        {status ? (
          <Box
            sx={{
              width: `${size}%`,
              overflow: "hidden",
              margin: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: `${size}%`, overflow: "hidden" }}>
            {imageUrlOld && (
              <img
                src={imageUrlOld}
                alt="ảnh ban đầu"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  cursor: "pointer",
                }}
                onClick={() => openModal(imageUrlOld)} // Khi nhấn vào ảnh sẽ phóng to
              />
            )}
          </Box>
        )}

        {statusNew ? (
          <Box
            sx={{
              width: `${98 - size}%`,
              overflow: "hidden",
              margin: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{ width: `${98 - size}%`, overflow: "hidden", display: "flex" }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Predicted"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  cursor: "pointer",
                }}
                onClick={() => openModal(imageUrl)} // Khi nhấn vào ảnh sẽ phóng to
              />
            )}
          </Box>
        )}
      </Box>

      {/* Modal hiển thị ảnh phóng to */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <IconButton
            onClick={closeModal}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "white",
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={modalImage}
            alt="Phóng to"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
      </Modal>

      {/* Danh sách các label và số lượng */}
      {imageUrl && showResult && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <CheckCircleOutlinedIcon
              sx={{ color: "green", fontSize: "40px" }}
            />
            <p>{"Kết quả"}</p>
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
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      marginRight: "5px",
                    }}
                  >
                    {label.symbol}
                    <span
                      style={{
                        fontWeight: "300",
                        fontSize: "12px",
                        marginRight: "2px",
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
};

export default Identification;
