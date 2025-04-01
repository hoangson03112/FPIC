import React, { useState, useEffect } from "react";
import axios from "axios";
import ZoomableImage from "./ZoomableImage";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { ChevronLeft, ChevronRight, Search } from "@mui/icons-material";
import { Col, Row, Card, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { REACT_APP_URL_SERVER, REACT_APP_URL_BE } from "./config";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";

const Transition = React.forwardRef((props, ref) => (
  <Fade ref={ref} {...props} timeout={700} />
));
function Accessory() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(18);
  const [pageAccessory, setPageAccessory] = useState(1);
  const [limitAccessory, setLimitAccessory] = useState(12);
  const [showModal, setShowModal] = useState(false);
  const [showModalDesc, setShowModalDesc] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [currentIndex, setCurrentIndex] = useState();
  const [search, setSearch] = useState();
  const [snackBar, setSnackBar] = useState({
    open: false,
    message: "",
    severity: "",
  });

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
  const [formType, setFormType] = useState({
    _id: "",
    tilte: "",
    image: "",
    contentType: "",
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
    }
  }, [currentIndex, data.accessories]); // Thêm data.accessories vào dependency

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await axios.get(
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
      const response = await axios.get(`${REACT_APP_URL_BE}/accessory`, {
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
      const response = await axios.post(`${REACT_APP_URL_BE}/accessory`, form, {
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
  const handleUpdateAccessory = async () => {
    //   const form = new FormData()
    //   form.append("title", formData.title)
    //   form.append("description", formData.description)
    //   form.append("type", formData.type)
    //   if (formData.image instanceof File) {
    //     form.append("file", formData.image)
    //   }
    //   try {
    //     const response = await axios.put(`${REACT_APP_URL_BE}/accessory/${formData._id}`,
    //       form, { headers: { "Content-Type": "multipart/form-data" } })
    //     if (response) {
    //       setSnackBar({
    //         open: true,
    //         message: `${response.data.message}`,
    //         severity: "success"
    //       })
    //       fetchData()
    //     }
    //   } catch (error) {
    //     setSnackBar({
    //       open: true,
    //       message: `Server error: ${error}`,
    //       severity: 'error'
    //     })
    //   }
    //   console.log(formData)
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
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Tìm kiếm linh kiện..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      endAdornment: search && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSearch("");
                              handleResultSearch("");
                            }}
                            sx={{ color: "text.secondary" }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: "28px",
                        backgroundColor: "background.paper",
                        boxShadow: 2,
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "1px solid",
                          borderColor: "divider",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                          borderWidth: "1px",
                        },
                      },
                    }}
                    value={search || ""}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      handleResultSearch(e.target.value);
                    }}
                  />

                  {/* Gợi ý tìm kiếm */}
                  {search && (
                    <Paper
                      sx={{
                        position: "absolute",
                        zIndex: 1300,
                        mt: 0.5,
                        left: 0,
                        right: 0,
                        maxHeight: 300,
                        overflow: "auto",
                        boxShadow: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <List dense>
                        {data.typesAccessories
                          .filter((item) =>
                            item.title
                              .toLowerCase()
                              .includes(search.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((item, index) => (
                            <ListItem
                              key={index}
                              button
                              onClick={() => {
                                setSearch(item.title);
                                handleResultSearch(item.title);
                              }}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                },
                              }}
                            >
                              <ListItemText
                                primary={item.title}
                                primaryTypographyProps={{
                                  fontWeight: "medium",
                                  color: "text.primary",
                                }}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </Paper>
                  )}
                </Box>

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

      <Dialog
        open={showModalDesc}
        onClose={() => handleClickModalDesc(false)}
        fullScreen
        TransitionComponent={Transition}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <DialogTitle
          sx={{ paddingTop: "10px", paddingBottom: "0px", paddingLeft: "0px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IconButton
              sx={{
                border: "none",
                boxShadow: "none",
                "&:hover": { backgroundColor: "transparent" },
              }}
              onClick={() => handleClickModalDesc(false)}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <Row xs={10}>
            {formAccessory && (
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between  mb-3">
                  <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <IconButton
                      onClick={hanldeClickPreviosImage}
                      sx={{
                        border: "none",
                        boxShadow: "none",
                        "&:hover": { backgroundColor: "transparent" },
                      }}
                    >
                      <ChevronLeft
                        style={{
                          width: 50,
                          backgroundColor: "white",
                          height: 30,
                          justifyContent: "center",
                        }}
                      />
                    </IconButton>

                    {formAccessory.image ? (
                      <ZoomableImage
                        data={
                          isBase64(formAccessory?.image)
                            ? `${REACT_APP_URL_BE}${decodeURIComponent(
                                escape(atob(formAccessory?.image))
                              )}`
                            : `${REACT_APP_URL_BE}${formAccessory?.image}`
                        }
                        alt={formAccessory?.title}
                      />
                    ) : (
                      <p>Không có ảnh</p>
                    )}
                    <IconButton
                      onClick={hanldeClickNextImage}
                      sx={{
                        border: "none",
                        boxShadow: "none",
                        "&:hover": { backgroundColor: "transparent" },
                      }}
                    >
                      <ChevronRight
                        style={{
                          width: 50,
                          backgroundColor: "white",
                          height: 30,
                          justifyContent: "center",
                        }}
                      />
                    </IconButton>
                  </div>
                  <Stack
                    spacing={4}
                    sx={{ padding: "16px", marginTop: "50px" }}
                  >
                    <TextField
                      name="title"
                      label="Tiêu đề"
                      onChange={handleInputChange}
                      value={formAccessory.title || ""}
                      sx={{ minWidth: "300px" }}
                      error={!!errors.title}
                      helperText={errors.title}
                    />

                    <TextField
                      name="description"
                      label="Mô tả"
                      onChange={handleInputChange}
                      value={formAccessory.description || ""}
                      sx={{ minWidth: "300px" }}
                      error={!!errors.description}
                      helperText={errors.description}
                    />
                    {/* <Autocomplete
                      options={typesAccessories}
                      value={typesAccessories.find((item) => item._id === formAccessory.type) || "underfine"}
                      getOptionLabel={(option) =>option.title}
                      renderInput={(params) => <TextField {...params} label="Loại"/>}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      disableClearable/> */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <Button
                        onClick={handleUpdateAccessory}
                        disabled={isLoadingButton}
                        startIcon={
                          isLoadingButton ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : null
                        }
                      >
                        Sửa
                      </Button>
                      <Button
                        disabled={isLoadingButton}
                        color="warning"
                        startIcon={
                          isLoadingButton ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : null
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                  </Stack>
                </div>

                <div className="w-100 mt-4">
                  <h6>More images:</h6>
                  <div className="d-flex flex-wrap justify-content-start">
                    {data.accessories.map((image, index) => {
                      return (
                        <Card
                          key={index}
                          className="m-2"
                          style={{
                            width: "100px",
                            cursor: "pointer",
                            border:
                              formAccessory && formAccessory._id === image._id
                                ? "3px solid orangered"
                                : "none",
                          }}
                          data-bs-target="#imageModal"
                          onClick={() => handleClickOnAnotherImage(index)}
                        >
                          <Card.Img
                            variant="top"
                            src={
                              isBase64(image?.image)
                                ? `${REACT_APP_URL_BE}${decodeURIComponent(
                                    escape(atob(image?.image))
                                  )}`
                                : `${REACT_APP_URL_BE}${image?.image}`
                            }
                            alt={image?.title}
                            style={{
                              width: "100%",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Row>
        </DialogContent>
      </Dialog>

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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
