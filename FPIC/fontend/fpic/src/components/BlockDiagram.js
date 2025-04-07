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
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Col } from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const BlockDiagram = () => {
  const [showModal, setShowModal] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [newPdf, setNewPdf] = useState({
    name: "",
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Fetch PDFs từ backend
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const response = await fetch("http://localhost:9999/fpic/sodokhoi");
        const data = await response.json();
        setPdfFiles(data);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
      }
    };

    fetchPdfs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPdf((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setNewPdf((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!newPdf.name.trim()) newErrors.name = "Vui lòng nhập tên tài liệu";
    if (!newPdf.file && !editingId) newErrors.file = "Vui lòng chọn file PDF"; // Nếu tạo mới mà không có file

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
        response = await fetch(
          `http://localhost:9999/fpic/sodokhoi/${editingId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
        data = await response.json();

        setPdfFiles(
          pdfFiles.map((pdf) =>
            pdf._id === editingId
              ? { ...pdf, name: data.name, filePath: data.filePath }
              : pdf
          )
        );
      } else {
        response = await fetch("http://localhost:9999/fpic/sodokhoi", {
          method: "POST",
          body: formData,
        });
        data = await response.json();
        setPdfFiles([data, ...pdfFiles]);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowModal(false);
      setNewPdf({ name: "", file: null, filePath: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error:", error);
      alert(`Có lỗi xảy ra: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        await fetch(`http://localhost:9999/fpic/sodokhoi/${id}`, {
          method: "DELETE",
        });

        setPdfFiles(pdfFiles.filter((pdf) => pdf._id !== id));
      } catch (error) {
        console.error("Error deleting PDF:", error);
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
    <div className="container-fluid">
      <Col md={2} className="text-end">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewPdf({ name: "", file: null });
            setEditingId(null);
            setShowModal(true);
          }}
          sx={{
            borderRadius: "28px",
            textTransform: "none",
            fontWeight: 600,
            py: 1,
          }}
        >
          Thêm tài liệu
        </Button>
      </Col>

      {/* Add/Edit PDF Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {editingId ? "Chỉnh sửa tài liệu" : "Thêm tài liệu PDF mới"}
          </span>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => {
              setShowModal(false);
              setErrors({});
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
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
              sx={{ mb: 2 }}
            />

            <input
              accept="application/pdf"
              style={{ display: "none" }}
              id="pdf-upload"
              type="file"
              onChange={handleFileChange}
            />

            <label htmlFor="pdf-upload">
              <Button
                component="span"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{
                  py: 2,
                  borderStyle: "dashed",
                  mb: 1,
                }}
              >
                Chọn file PDF
              </Button>
            </label>

            {editingId && !newPdf.file && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Đã chọn: {newPdf.filePath.split("\\").pop().split("/").pop()}
              </Typography>
            )}
            {newPdf.file && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Đã chọn: {newPdf.file.name}
              </Typography>
            )}

            {errors.file && (
              <Typography color="error" variant="body2">
                {errors.file}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setShowModal(false);
              setErrors({});
            }}
            sx={{ mr: 2 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting
              ? "Đang tải lên..."
              : editingId
              ? "Cập nhật tài liệu"
              : "Lưu tài liệu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF List */}
      <div className="row">
        {pdfFiles.map((file) => (
          <div key={file._id} className="col-md-6 mb-4 mt-4">
            <div className="card">
              <div className="card-body">
                <div style={{ height: "600px" }}>
                  <object
                    data={`http://localhost:9999/${file.filePath}`}
                    type="application/pdf"
                    className="w-100 h-100"
                  >
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Trình duyệt không hỗ trợ xem PDF
                    </div>
                  </object>
                </div>
                <div className="text-center mt-3">
                  <div className="mb-2">
                    <strong>{file.name}</strong>
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(file)}
                    sx={{ ml: 1 }}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(file._id)}
                    sx={{ ml: 1 }}
                    color="error"
                  >
                    Xóa
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      window.open(
                        `http://localhost:9999/${file.filePath}`,
                        "_blank"
                      )
                    }
                    sx={{ ml: 1 }}
                  >
                    Xem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockDiagram;
