import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  Chip,
  Divider,
  InputAdornment,
  Fade,
  useTheme,
  alpha,
  MenuItem,
  Pagination,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Memory,
  Close,
  Upload,
  Image,
  Visibility,
  CalendarToday,
  Info,
} from "@mui/icons-material";
import axios from "axios";
import { REACT_APP_URL_BE } from "../config";

const MicrochipList = () => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  // State management
  const [microchips, setMicrochips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [currentMicrochip, setCurrentMicrochip] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [microchipToDelete, setMicrochipToDelete] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  // Pagination and search state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Filter microchips based on search term
  const filteredMicrochips = microchips.filter(
    (microchip) =>
      microchip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      microchip.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current page items
  const paginatedMicrochips = filteredMicrochips.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredMicrochips.length / rowsPerPage);

  // Pagination handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Search handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = microchips
        .filter(
          (microchip) =>
            microchip.name?.toLowerCase().includes(value.toLowerCase()) ||
            microchip.description?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions

      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (microchip) => {
    setSearchTerm(microchip.name);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Fetch microchips data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${REACT_APP_URL_BE}/microchips`);
        setMicrochips(response.data.microchips);
      } catch (error) {
        showSnackbar("Lỗi khi tải dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show notification
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Dialog handlers
  const handleOpenDialog = (microchip = null) => {
    setCurrentMicrochip(microchip);

    if (microchip) {
      setFormData({
        name: microchip.name,
        description: microchip.description,
        image: null,
      });
      setPreviewImage(microchip.imagePath);
    } else {
      setFormData({
        name: "",
        description: "",
        image: null,
      });
      setPreviewImage(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPreviewImage(null);
  };

  // Details dialog handlers
  const handleOpenDetailsDialog = (microchip) => {
    setCurrentMicrochip(microchip);

    setPreviewImage(microchip.imageURL);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (currentMicrochip) {
        // Update

        const response = await axios.put(
          `${REACT_APP_URL_BE}/microchips/${currentMicrochip._id}`,
          submitData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setMicrochips(
          microchips.map((item) =>
            item._id === currentMicrochip._id ? response.data.microchip : item
          )
        );
        showSnackbar("Cập nhật vi mạch thành công", "success");
      } else {
        // Create
        const response = await axios.post(
          `${REACT_APP_URL_BE}/microchips`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        setMicrochips([...microchips, response.data.newMicrochip]);
        showSnackbar("Thêm vi mạch thành công", "success");
      }
      handleCloseDialog();
    } catch (error) {
      showSnackbar("Lỗi khi lưu vi mạch", "error");
    }
  };

  // Delete handlers
  const handleDeleteConfirm = (microchip) => {
    setMicrochipToDelete(microchip);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${REACT_APP_URL_BE}/microchips/${microchipToDelete._id}`
      );
      setMicrochips(
        microchips.filter((item) => item._id !== microchipToDelete._id)
      );
      setPage(1);
      showSnackbar("Xóa vi mạch thành công", "success");
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      showSnackbar("Lỗi khi xóa vi mạch", "error");
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{ flexDirection: "column", gap: 2 }}
      >
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with gradient background */}
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
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "white",
              color: theme.palette.primary.main,
              fontWeight: "bold",
              "&:hover": {
                bgcolor: alpha(theme.palette.common.white, 0.9),
              },
            }}
          >
            Thêm mới
          </Button>
        </Box>
      </Paper>

      {/* Search Bar */}
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
          onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
            {searchSuggestions.map((microchip) => (
              <MenuItem
                key={microchip._id}
                onClick={() => handleSelectSuggestion(microchip)}
                sx={{
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <CardMedia
                    component="img"
                    image={`${REACT_APP_URL_BE}${microchip.imagePath}`}
                    alt={microchip.name}
                    sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
                    onError={(e) => {
                      e.target.src = "/placeholder-microchip.png";
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1">
                      {microchip.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {microchip.description.substring(0, 50)}...
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Paper>
        )}
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          Hiển thị{" "}
          <Chip
            label={filteredMicrochips.length}
            color="primary"
            size="small"
          />{" "}
          vi mạch
        </Typography>
      </Box>

      {/* Empty state */}
      {filteredMicrochips.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.light, 0.1),
            border: `1px dashed ${theme.palette.primary.main}`,
            mt: 3,
          }}
        >
          <Memory sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm
              ? "Không tìm thấy kết quả phù hợp"
              : "Không có vi mạch nào"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm
              ? "Hãy thử tìm kiếm với từ khóa khác"
              : "Hãy thêm vi mạch mới để bắt đầu"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Thêm vi mạch mới
          </Button>
        </Paper>
      )}

      {/* Microchips Grid with animation */}
      <Grid container spacing={3}>
        {paginatedMicrochips.map((microchip) => (
          <Grid item xs={12} sm={6} md={4} key={microchip._id}>
            <Card
              elevation={1}
              sx={{
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={`${REACT_APP_URL_BE}${microchip.imagePath}`}
                alt={microchip.name}
                onError={(e) => {
                  e.target.src = "/placeholder-microchip.png";
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {microchip.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    mb: 1,
                  }}
                >
                  {microchip.description}
                </Typography>
                {microchip.createdAt && (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <CalendarToday
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(microchip.createdAt)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                <Button
                  size="small"
                  color="info"
                  onClick={() => handleOpenDetailsDialog(microchip)}
                  startIcon={<Visibility />}
                >
                  Chi tiết
                </Button>
                <Box>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(microchip)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteConfirm(microchip)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {filteredMicrochips.length > rowsPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        {currentMicrochip && (
          <>
            <DialogTitle sx={{ bgcolor: "info.main", color: "white", py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Visibility sx={{ mr: 1 }} />
                Chi tiết Vi mạch: {currentMicrochip.name}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: "100%",
                      overflow: "hidden",
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={`${REACT_APP_URL_BE}${currentMicrochip.imagePath}`}
                      alt={currentMicrochip.name}
                      sx={{
                        height: 300,
                        objectFit: "contain",
                        bgcolor: alpha(theme.palette.primary.light, 0.1),
                        p: 2,
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder-microchip.png";
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" gutterBottom fontWeight="500">
                    {currentMicrochip.name}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="bold"
                  >
                    Mô tả
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentMicrochip.description}
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thông tin chi tiết
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày tạo
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {formatDate(currentMicrochip.createdAt)}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Cập nhật lần cuối
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(currentMicrochip.updatedAt)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, justifyContent: "end" }}>
              <Button onClick={handleCloseDetailsDialog} variant="outlined">
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white", py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Memory sx={{ mr: 1 }} />
            {currentMicrochip ? "Chỉnh sửa Vi mạch" : "Thêm Vi mạch mới"}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên vi mạch"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
                ref={fileInputRef}
                id="upload-microchip-image"
              />
              <label htmlFor="upload-microchip-image">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<Upload />}
                  sx={{ py: 1.5 }}
                >
                  {formData.image
                    ? "Đã chọn: " + formData.image.name
                    : "Tải lên hình ảnh"}
                </Button>
              </label>
            </Grid>
            {previewImage && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "grey.100",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Xem trước hình ảnh
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      position: "relative",
                      "&:hover .overlay": {
                        opacity: 1,
                      },
                    }}
                  >
                    <img
                      src={
                        formData.image
                          ? previewImage
                          : currentMicrochip
                          ? `${REACT_APP_URL_BE}${previewImage}`
                          : previewImage
                      }
                      alt="Preview"
                      style={{
                        maxHeight: "140px",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder-microchip.png";
                      }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        opacity: 0,
                        transition: "opacity 0.3s",
                        borderRadius: "4px",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => fileInputRef.current.click()}
                      >
                        Thay đổi
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
            {!previewImage && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    border: "1px dashed grey.400",
                  }}
                >
                  <Image
                    sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Chưa có hình ảnh
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={currentMicrochip ? <Edit /> : <Add />}
            disabled={
              !formData.name ||
              !formData.description ||
              (!formData.image && !currentMicrochip)
            }
          >
            {currentMicrochip ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ color: "error.main" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Delete sx={{ mr: 1 }} />
            Xác nhận xóa
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa vi mạch{" "}
            <strong>{microchipToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setIsDeleteConfirmOpen(false)}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MicrochipList;
