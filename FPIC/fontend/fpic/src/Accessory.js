import React, { useState, useEffect } from "react";
import axios from "axios";

import "./Accessory.css";
import SearchIcon from "@mui/icons-material/Search";
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
  InputAdornment,
  Paper,
  ListItem,
  List,
  ListItemText,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
} from "@mui/material";

import {
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  Collections as CollectionsIcon,
  Info as InfoIcon,
  Memory,
  Add,
} from "@mui/icons-material";

import { Col, Row, Card, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { REACT_APP_URL_SERVER, REACT_APP_URL_BE } from "./config";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { AccessoryDetailDialog } from "./components/AccessoryDetailDialog";
import api from "./api";
import { AuthContext } from "./context/AuthContext";
import { hasPermission } from "./helper/function";

const Transition = React.forwardRef((props, ref) => (
  <Fade ref={ref} {...props} timeout={700} />
));
function Accessory() {
  const theme = useTheme();
  const { user } = React.useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(18);
  const [pageAccessory, setPageAccessory] = useState(1);
  const [limitAccessory, setLimitAccessory] = useState(12);
  const [showModal, setShowModal] = useState(false);
  const [showModalDesc, setShowModalDesc] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [currentIndex, setCurrentIndex] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [snackBar, setSnackBar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [formDataUpdate, setFormDataUpdate] = useState({});
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    image: null,
    type: "",
    description: "",
  });
  const [data, setData] = useState({
    typesAccessories: [],
    accessories: [],
    pagination: { totalPages: 0, currentPage: 1, totalItem: 0 },
    pagination_access: { totalPages: 0, currentPage: 1, totalItem: 0 },
    isLoading: false,
    error: null,
  });
  const [formAccessory, setFormAccessory] = useState({
    _id: "",
    title: "",
    image: "",
    type: "",
    description: "",
  });
  useEffect(() => {
    fetchData();
  }, [page, limit, search]);
  useEffect(() => {
    const item = data.accessories[currentIndex];

    if (item) {
      setFormAccessory({ ...item });
      setFormDataUpdate({ ...item });
    }
  }, [currentIndex, data.accessories]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      try {
        const response = await api.get(
          `${REACT_APP_URL_BE}/search-accessories`,
          {
            params: { query: value, limit: 5 },
          }
        );
        setSearchSuggestions(response.data.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchSuggestions([]);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Add suggestion selection handler
  const handleSelectSuggestion = (accessory) => {
    setSearchTerm(accessory.title);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    // You can add additional logic here to navigate or show the selected accessory
  };
  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.get(
        `${REACT_APP_URL_BE}/get-types-accessory`,
        {
          params: { page, limit, query: search },
        }
      );
      setData((prev) => ({
        ...prev,
        typesAccessories: response.data.data || [],
        pagination: response.data.pagination || {
          totalPages: 0,
          currentPage: 1,
        },
        isLoading: false,
      }));
    } catch (error) {
      setData((prev) => ({ ...prev, isLoading: false, error }));
      setSnackBar({
        open: true,
        message: error.response?.data?.message || "Lỗi hệ thống",
        severity: "error",
      });
    }
  };
  const fetchAccessories = async (type) => {
    if (data.isLoading) return;
    const controller = new AbortController();
    try {
      const response = await api.get(`${REACT_APP_URL_BE}/accessory`, {
        params: { page: pageAccessory, limit: limitAccessory, type: type },
        signal: controller.signal,
      });
      if (response) {
        setData((prev) => ({
          ...prev,
          accessories: response.data.data,
          pagination_access: response.data.pagination,
        }));
        setFormAccessory({ ...response.data.data[0] });
        setFormDataUpdate({ ...response.data.data[0] });
      }
    } catch (error) {
      console.log(error);
      setData((prev) => ({ ...prev, error }));
      setSnackBar({
        open: true,
        message: error,
        severity: "error",
      });
    }
    return () => controller.abort();
  };
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, data.pagination.totalPages)));
  };
  const handleInputChange = (event) => {
    const { name, type, value, files } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };
  const handleClickItem = (type, index) => {
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
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? data.accessories.length - 1 : prevIndex - 1
    );
  };
  const handleSnackbarClose = () => {
    setSnackBar({ open: false, message: "", severity: "" });
  };
  const handleClickModalDesc = (status) => {
    if (status) {
      setShowModalDesc(status);
    } else {
      setShowModalDesc(status);
      setFormAccessory({ ...data.accessories[currentIndex] });
    }
  };

  const handleCreateAccessory = async () => {
    setIsLoadingButton(true);
    let form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description ?? "");
    form.append("type", formData.type);
    form.append("file", formData.image);
    try {
      const response = await api.post(`${REACT_APP_URL_BE}/accessory`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response) {
        setSnackBar({
          open: true,
          message: `${response.data.message}`,
          severity: "success",
        });
        fetchData();
        setShowModal(false);
        setFormData((prev) =>
          Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: "" }))
        );
        setIsLoadingButton(false);
      }
    } catch (error) {
      setSnackBar({
        open: true,
        message: `Server error: ${error}`,
        severity: "error",
      });
    }
  };

  const handleResultSearch = (result) => {
    setSearch(result);
  };

  function isBase64(str) {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  return (
    <div className="bg-image">
      <Container fluid>
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
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Quản lý Vi mạch
              </Typography>
              <Paper
                elevation={1}
                sx={{ p: 2, mb: 4, borderRadius: 2, position: "relative" }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Tìm kiếm vi mạch theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    searchTerm.length > 0 && setShowSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="clear search"
                          onClick={() => {
                            setSearchTerm("");
                            setSearchSuggestions([]);
                            fetchData(); // Reset to show all items
                          }}
                          edge="end"
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 1.5 },
                  }}
                />

                {showSuggestions && searchSuggestions.length > 0 && (
                  <Paper
                    elevation={3}
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1,
                      mt: 1,
                      maxHeight: 300,
                      overflow: "auto",
                    }}
                  >
                    {searchSuggestions.map((accessory) => (
                      <MenuItem
                        key={accessory._id}
                        onClick={() => handleSelectSuggestion(accessory)}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          {accessory.image ? (
                            <CardMedia
                              component="img"
                              image={`${REACT_APP_URL_BE}${accessory.image}`}
                              alt={accessory.title}
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                borderRadius: 1,
                              }}
                              onError={(e) => {
                                e.target.src = "/placeholder-microchip.png";
                              }}
                            />
                          ) : (
                            <ImageNotSupportedIcon
                              sx={{ width: 40, height: 40, mr: 2 }}
                            />
                          )}
                          <Box>
                            <Typography variant="subtitle1">
                              {accessory.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {accessory.description?.substring(0, 50) ||
                                "Không có mô tả"}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Paper>
                )}
              </Paper>
            </Box>
          </Box>
        </Paper>
        <Row>
          <Col className="main-content">
            <div className="app">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                  p: 2,
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    maxWidth: 600,
                    position: "relative",
                    mr: 2,
                  }}
                ></Box>
                {hasPermission(user, "addAccessory") && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowModal(true)}
                    sx={{
                      borderRadius: "28px",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                    }}
                  >
                    Thêm linh kiện
                  </Button>
                )}
              </Box>

              <div className="table">
                <div>
                  {data.isLoading ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <div className="image-grid">
                      {data.typesAccessories.map((type, index) => (
                        <Card
                          key={index}
                          className="m-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleClickItem(type, index)}
                        >
                          <Card.Img
                            variant="top"
                            src={`${REACT_APP_URL_BE}${
                              type.image ? atob(type.image) : ""
                            }`}
                            alt={type?.title}
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                            }}
                          />
                          <Card.Body>
                            <Card.Title>
                              {type?.title || "Không có tiêu đề"}
                            </Card.Title>
                            <Card.Text>
                              {type?.description || "Không có mô tả"}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div
                className="pagination-footer"
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Pagination
                  count={data.pagination.totalPages}
                  page={data.pagination.currentPage}
                  onChange={(_, newPage) => handlePageChange(newPage)}
                  showFirstButton
                  showLastButton
                  shape="rounded"
                  siblingCount={2}
                  boundaryCount={1}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>

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
      />

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
            <Grid container spacing={0} sx={{ py: 3 }}>
              <Grid item xs={12} md={6} sx={{ paddingRight: 1 }}>
                <TextField
                  fullWidth
                  name="title"
                  label="Tên linh kiện"
                  variant="outlined"
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

              <Grid item xs={12} md={6} sx={{ paddingLeft: 1 }}>
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
