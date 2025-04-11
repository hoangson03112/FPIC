import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Container,
  Paper,
  Tooltip,
  Snackbar,
  Alert,
  Fab,
  Divider,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import api from "../api";
import { REACT_APP_URL_BE } from "../config";
import { AuthContext } from "../context/AuthContext";
import { hasPermission } from "../helper/function";

const BlockDiagram = () => {
  const { user } = React.useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [newPdf, setNewPdf] = useState({
    name: "",
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch PDFs from backend
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const response = await api.get(`${REACT_APP_URL_BE}/fpic/sodokhoi`);

        setPdfFiles(response.data);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        showSnackbar("Không thể tải danh sách tài liệu", "error");
      }
    };

    fetchPdfs();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPdf((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewPdf((prev) => ({
        ...prev,
        file: e.target.files[0],
      }));
      // Clear file error when user selects a file
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: null }));
      }
    }
  };

  const resetForm = () => {
    setNewPdf({ name: "", file: null });
    setEditingId(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!newPdf.name.trim()) newErrors.name = "Vui lòng nhập tên tài liệu";
    if (!newPdf.file && !editingId) newErrors.file = "Vui lòng chọn file PDF";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", newPdf.name);

    if (newPdf.file) {
      formData.append("pdf", newPdf.file);
    }

    try {
      let response;
      let data;

      if (editingId) {
        response = await api.put(
          `${REACT_APP_URL_BE}/fpic/sodokhoi/${editingId}`,

          formData
        );

        setPdfFiles(
          pdfFiles.map((pdf) =>
            pdf._id === editingId
              ? {
                  ...pdf,
                  name: response.data.name,
                  filePath: response.data.filePath,
                }
              : pdf
          )
        );
        showSnackbar("Cập nhật tài liệu thành công");
      } else {
        response = await api.post(
          `${REACT_APP_URL_BE}/fpic/sodokhoi`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setPdfFiles([response.data, ...pdfFiles]);
        showSnackbar("Thêm tài liệu thành công");
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      showSnackbar(`Có lỗi xảy ra: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        const response = await api.delete(
          `${REACT_APP_URL_BE}/fpic/sodokhoi/${id}`
        );

        if (response) {
          setPdfFiles(pdfFiles.filter((pdf) => pdf._id !== id));
          showSnackbar("Xóa tài liệu thành công");
        } else {
          throw new Error("Không thể xóa tài liệu");
        }
      } catch (error) {
        console.error("Error deleting PDF:", error);
        showSnackbar("Không thể xóa tài liệu", "error");
      }
    }
  };

  const handleEdit = (pdf) => {
    setNewPdf({
      name: pdf.name,
      file: null,
      filePath: pdf.filePath,
    });
    setEditingId(pdf._id);
    setShowModal(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Sơ Đồ Khối
        </Typography>
        {hasPermission(user, "addBlockDiagram") && (
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            sx={{ boxShadow: 3 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* PDF List */}
      <Grid container spacing={3}>
        {pdfFiles.length === 0 ? (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                bgcolor: "grey.50",
                borderRadius: 2,
              }}
            >
              <PictureAsPdfIcon
                sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5 }}
              />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Chưa có tài liệu nào. Hãy thêm tài liệu mới.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          pdfFiles.map((file) => (
            <Grid key={file._id} item xs={12} md={6}>
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Box sx={{ height: 500, position: "relative" }}>
                    <object
                      data={`${REACT_APP_URL_BE}/${file.filePath}`}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          p: 3,
                          bgcolor: "grey.100",
                        }}
                      >
                        <PictureAsPdfIcon
                          sx={{ fontSize: 60, color: "error.main" }}
                        />
                        <Typography sx={{ mt: 2 }}>
                          Trình duyệt không hỗ trợ xem PDF
                        </Typography>
                      </Box>
                    </object>
                  </Box>
                </CardContent>

                <Divider />

                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, mb: 1, textAlign: "center" }}
                  >
                    {file.name}
                  </Typography>

                  <CardActions sx={{ justifyContent: "center", gap: 1 }}>
                    {hasPermission(user, "UpdateAndDeleteBlockDiagram") && (
                      <>
                        <Tooltip title="Sửa">
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(file)}
                          >
                            Sửa
                          </Button>
                        </Tooltip>

                        <Tooltip title="Xóa">
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(file._id)}
                          >
                            Xóa
                          </Button>
                        </Tooltip>
                      </>
                    )}

                    <Tooltip title="Xem full-screen">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        onClick={() =>
                          window.open(
                            `${REACT_APP_URL_BE}/${file.filePath}`,
                            "_blank"
                          )
                        }
                      >
                        Xem
                      </Button>
                    </Tooltip>
                  </CardActions>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit PDF Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {editingId ? <EditIcon /> : <AddIcon />}
            <Typography variant="h6">
              {editingId ? "Chỉnh sửa tài liệu" : "Thêm tài liệu PDF mới"}
            </Typography>
          </Box>

          <IconButton
            edge="end"
            color="inherit"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3, px: 3 }}>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Tên tài liệu"
              name="name"
              value={newPdf.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 3 }}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1 },
              }}
            />

            <input
              accept="application/pdf"
              style={{ display: "none" }}
              id="pdf-upload"
              type="file"
              onChange={handleFileChange}
            />

            <Box sx={{ textAlign: "center" }}>
              <label htmlFor="pdf-upload">
                <Button
                  component="span"
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    py: 3,
                    borderStyle: "dashed",
                    borderRadius: 1,
                    borderWidth: "2px",
                    borderColor: errors.file ? "error.main" : "primary.main",
                    "&:hover": {
                      borderColor: "primary.dark",
                      bgcolor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Chọn file PDF
                </Button>
              </label>
            </Box>

            {editingId && !newPdf.file && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PictureAsPdfIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Đã chọn: {newPdf.filePath.split("\\").pop().split("/").pop()}
                </Typography>
              </Box>
            )}

            {newPdf.file && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PictureAsPdfIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Đã chọn: {newPdf.file.name}
                </Typography>
              </Box>
            )}

            {errors.file && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 1, textAlign: "center" }}
              >
                {errors.file}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            sx={{ mr: 2, borderRadius: 28, px: 3 }}
          >
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            sx={{ borderRadius: 28, px: 3 }}
          >
            {isSubmitting
              ? "Đang tải lên..."
              : editingId
              ? "Cập nhật tài liệu"
              : "Lưu tài liệu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlockDiagram;
