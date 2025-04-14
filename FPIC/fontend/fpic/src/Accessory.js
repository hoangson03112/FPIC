import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useTheme, alpha } from "@mui/material";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Snackbar,
  Stack,
  TextField,
  Fade,
  Autocomplete,
  Box,
  Typography,
  Grid,
} from "@mui/material";

// Icons
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Save as SaveIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  Memory,
  Add as AddIcon,
} from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Components and utils
import "./Accessory.css";
import { Col, Row, Card, Container } from "react-bootstrap";
import { AccessoryDetailDialog } from "./components/AccessoryDetailDialog";
import { REACT_APP_URL_BE } from "./config";
import api from "./api";
import SeachBox from "./components/SeachBox";
import RenderActionBar from "./components/renderActionBar";

const Transition = React.forwardRef((props, ref) => (
  <Fade ref={ref} {...props} timeout={700} />
));

function Accessory() {
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(18);
  const [pageAccessory, setPageAccessory] = useState(1);
  const [limitAccessory] = useState(12);

  const [showModal, setShowModal] = useState(false);
  const [showModalDesc, setShowModalDesc] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formDataUpdate, setFormDataUpdate] = useState({});
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    image: null,
    type: "",
    description: "",
  });
  const [formAccessory, setFormAccessory] = useState({
    _id: "",
    title: "",
    image: "",
    type: "",
    description: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [data, setData] = useState({
    typesAccessories: [],
    accessories: [],
    pagination: { totalPages: 0, currentPage: 1, totalItem: 0 },
    pagination_access: { totalPages: 0, currentPage: 1, totalItem: 0 },
    isLoading: false,
    error: null,
  });

  const [snackBar, setSnackBar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    fetchData();
  }, [page, limit, search]);

  // Update accessory page data when pageAccessory changes
  useEffect(() => {
    if (data.accessories.length > 0 && formAccessory.type) {
      fetchAccessories(formAccessory.type);
    }
  }, [pageAccessory, limitAccessory]);

  useEffect(() => {
    const item = data.accessories[currentIndex];
    if (item) {
      setFormAccessory({ ...item });
      setFormDataUpdate({ ...item });
    }
  }, [currentIndex, data.accessories]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch(searchTerm);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.get(
        `${REACT_APP_URL_BE}/get-types-accessory`,
        {
          params: { page, limit, query: search },
        }
      );
      console.log(response);
      setData((prev) => ({
        ...prev,
        typesAccessories: response.data.data || [],
        pagination: response.data.pagination || {
          totalPages: 0,
          currentPage: 1,
          totalItem: 0,
        },
        isLoading: false,
      }));

      // Ensure page state matches response
      if (response.data.pagination?.currentPage) {
        setPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      setData((prev) => ({ ...prev, isLoading: false, error }));
      showNotification(
        error.response?.data?.message || "Lỗi hệ thống",
        "error"
      );
    }
  };

  const fetchAccessories = async (type) => {
    if (data.isLoading) return;

    const controller = new AbortController();
    try {
      setData((prev) => ({ ...prev, isLoading: true }));
      const response = await api.get(`${REACT_APP_URL_BE}/accessory`, {
        params: { page: pageAccessory, limit: limitAccessory, type },
        signal: controller.signal,
      });

      if (response) {
        setData((prev) => ({
          ...prev,
          accessories: response.data.data,
          pagination_access: response.data.pagination,
          isLoading: false,
        }));

        // Update current page state to match response
        if (response.data.pagination?.currentPage) {
          setPageAccessory(response.data.pagination.currentPage);
        }

        if (response.data.data?.length > 0) {
          setCurrentIndex(0);
          setFormAccessory({ ...response.data.data[0] });
          setFormDataUpdate({ ...response.data.data[0] });
        }
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        setData((prev) => ({ ...prev, error, isLoading: false }));
        showNotification(
          error.response?.data?.message || "Lỗi hệ thống",
          "error"
        );
      }
    }

    return () => controller.abort();
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      clearSearchState();
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(
        `${REACT_APP_URL_BE}/get-types-accessory`,
        {
          params: { query, limit: 5 },
        }
      );

      setSearchSuggestions(response.data.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchSuggestions([]);
      showNotification("Không thể tìm kiếm. Vui lòng thử lại sau.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateAccessory = async () => {
    setIsLoadingButton(true);

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description ?? "");
    form.append("type", formData.type);
    form.append("file", formData.image);

    try {
      const response = await api.post(`${REACT_APP_URL_BE}/accessory`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response) {
        showNotification(response.data.message, "success");
        fetchData();
        resetFormData();
        setShowModal(false);
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || `Lỗi máy chủ: ${error}`,
        "error"
      );
    } finally {
      setIsLoadingButton(false);
    }
  };

  // Helper Functions
  const showNotification = (message, severity) => {
    setSnackBar({
      open: true,
      message,
      severity,
    });
  };

  const resetFormData = () => {
    setFormData({
      _id: "",
      title: "",
      image: null,
      type: "",
      description: "",
    });
  };

  const clearSearchState = () => {
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSearch("");
  };

  const isBase64 = React.useMemo((str) => {
    return (str) => {
      try {
        return btoa(atob(str)) === str;
      } catch (err) {
        return false;
      }
    };
  }, []);

  // Event Handlers
  const handlePageChange = (_, newPage) => {
    // Update page state - this will trigger the useEffect to fetch data
    setPage(newPage);
  };

  // Handler for accessory pagination
  const handleAccessoryPageChange = (_, newPage) => {
    // Update pageAccessory state - this will trigger the useEffect to fetch accessories
    setPageAccessory(newPage);
  };

  const handleInputChange = (event) => {
    const { name, type, value, files } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      clearSearchState();
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearch(searchTerm);
    setShowSuggestions(false);
    // Reset to page 1 when submitting a new search
    setPage(1);
  };

  const handleSelectSuggestion = (accessory) => {
    setSearchTerm(accessory.title);
    setSearch(accessory.title);
    setShowSuggestions(false);
    // Reset to page 1 when selecting a suggestion
    setPage(1);

    if (accessory.type) {
      fetchAccessories(accessory.type);
      handleClickModalDesc(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearch("");
    clearSearchState();
    // Reset to page 1 when clearing search
    setPage(1);
    fetchData();
  };

  const handleClickItem = (type) => {
    // Reset accessory pagination when viewing a new type
    setPageAccessory(1);
    fetchAccessories(type._id);
    handleClickModalDesc(true);
  };

  const handleClickOnAnotherImage = (index) => {
    setCurrentIndex(index);
  };

  const hanldeClickNextImage = () => {
    if (data.accessories.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.accessories.length);
    }
  };

  const hanldeClickPreviosImage = () => {
    if (data.accessories.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? data.accessories.length - 1 : prevIndex - 1
      );
    }
  };

  const handleSnackbarClose = () => {
    setSnackBar({ open: false, message: "", severity: "" });
  };

  const handleClickModalDesc = (status) => {
    setShowModalDesc(status);
    if (!status && data.accessories[currentIndex]) {
      setFormAccessory({ ...data.accessories[currentIndex] });
    }
  };

  const renderAccessoryGrid = () => {
    if (data.isLoading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      );
    }

    if (data.typesAccessories.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <ImageNotSupportedIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6">
            {search
              ? "Không tìm thấy linh kiện phù hợp"
              : "Chưa có linh kiện nào được thêm vào"}
          </Typography>
          <Typography color="text.secondary">
            {search
              ? "Vui lòng thử tìm kiếm với từ khóa khác"
              : "Bắt đầu bằng cách thêm linh kiện mới"}
          </Typography>
        </Box>
      );
    }

    return (
      <div className="image-grid">
        {data.typesAccessories.map((type, index) => (
          <Card
            key={type._id || index}
            className="m-2"
            style={{ cursor: "pointer" }}
            onClick={() => handleClickItem(type)}
          >
            <Card.Img
              variant="top"
              src={`${REACT_APP_URL_BE}${
                type.image && isBase64(type.image)
                  ? atob(type.image)
                  : type.image
              }`}
              alt={type?.title}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = "/placeholder-microchip.png";
              }}
            />
            <Card.Body>
              <Card.Title>{type?.title || "Không có tiêu đề"}</Card.Title>
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  };

  const renderAddAccessoryDialog = () => (
    <Dialog
      open={showModal}
      onClose={() => setShowModal(false)}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Thêm linh kiện mới
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => setShowModal(false)}
          sx={{
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2} sx={{ py: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="title"
                label="Tên linh kiện"
                variant="outlined"
                value={formData.title || ""}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={data.typesAccessories || []}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Loại linh kiện"
                    error={!!errors.type}
                    helperText={errors.type}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    type: newValue?._id || "",
                  }));
                }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            name="description"
            label="Mô tả"
            variant="outlined"
            multiline
            rows={4}
            value={formData.description || ""}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
              Hình ảnh linh kiện
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{
                py: 2,
                borderRadius: "8px",
                borderStyle: "dashed",
                "&:hover": {
                  borderStyle: "dashed",
                },
              }}
            >
              Tải lên hình ảnh
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                hidden
              />
            </Button>
            {formData.image && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Đã chọn: {formData.image.name || "Ảnh linh kiện"}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleCreateAccessory}
              disabled={isLoadingButton}
              startIcon={
                isLoadingButton ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{
                px: 4,
                py: 1,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              {isLoadingButton ? "Đang thêm..." : "Lưu linh kiện"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );

  // Main Render
  return (
    <div className="bg-image">
      <Box>
        <SeachBox
          handleSearchSubmit={handleSearchSubmit}
          handleSearchChange={handleSearchChange}
          searchTerm={searchTerm}
          setShowSuggestions={setShowSuggestions}
          clearSearch={clearSearch}
          showSuggestions={showSuggestions}
          searchSuggestions={searchSuggestions}
          handleSelectSuggestion={handleSelectSuggestion}
          isBase64={isBase64}
          isSearching={isSearching}
          setShowModal={setShowModal}
        />

        <Row>
          <Col className="main-content">
            <div className="app">
              <RenderActionBar
                search={search}
                clearSearch={clearSearch}
                setShowModal={setShowModal}
              />

              <div className="table">
                <div>{renderAccessoryGrid()}</div>
              </div>

              {/* Main pagination for types of accessories */}
              {data.pagination.totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                    padding: "10px",
                  }}
                >
                  <Pagination
                    count={data.pagination.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    showFirstButton
                    showLastButton
                    shape="rounded"
                    color="primary"
                    size="large"
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}
            </div>
          </Col>
        </Row>
      </Box>

      <AccessoryDetailDialog
        showModalDesc={showModalDesc}
        handleClickModalDesc={handleClickModalDesc}
        formAccessory={formAccessory}
        data={data}
        formDataUpdate={formDataUpdate}
        setFormDataUpdate={setFormDataUpdate}
        errors={errors}
        isLoadingButton={isLoadingButton}
        handleClickOnAnotherImage={handleClickOnAnotherImage}
        hanldeClickPreviosImage={hanldeClickPreviosImage}
        hanldeClickNextImage={hanldeClickNextImage}
        Transition={Transition}
        isBase64={isBase64}
        setIsLoadingButton={setIsLoadingButton}
        setSnackBar={setSnackBar}
        setData={setData}
        // Add these props for the AccessoryDetailDialog pagination
        pageAccessory={pageAccessory}
        handleAccessoryPageChange={handleAccessoryPageChange}
      />

      {renderAddAccessoryDialog()}

      <Snackbar
        open={snackBar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={handleSnackbarClose}
        TransitionComponent={Transition}
      >
        <Alert onClose={handleSnackbarClose} severity={snackBar.severity}>
          {snackBar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
export default Accessory;
