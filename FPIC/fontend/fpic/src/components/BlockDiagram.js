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
import React, { useState } from "react";
import { Col } from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const PDFViewer = () => {
  const [showModal, setShowModal] = useState(false);
  const [newPdf, setNewPdf] = useState({
    name: "",
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const pdfFiles = [
    { id: 1, url: "/j.pdf", name: "LS1043ARDB-PC-DDR" },
    { id: 2, url: "/i.pdf", name: "Main Board FPGA " },
    {
      id: 3,
      url: "/compal_la-7901p_r1.0_schematics.pdf",
      name: "Korbel 14 UMA--Non vPRO ",
    },
  ];

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

  const handleSubmit = () => {
    // Validate form
    const newErrors = {};
    if (!newPdf.name.trim()) newErrors.name = "Vui lòng nhập tên tài liệu";
    if (!newPdf.file) newErrors.file = "Vui lòng chọn file PDF";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Here you would typically upload to server
    console.log("Submitting:", newPdf);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(false);
      setNewPdf({ name: "", file: null });
      setErrors({});
      // In a real app, you would update the pdfFiles state here
    }, 1500);
  };

  return (
    <div className="container-fluid">
      <Col md={2} className="text-end">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
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

      {/* Add PDF Modal */}
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
          <span>Thêm tài liệu PDF mới</span>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setShowModal(false)}
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
          <Button onClick={() => setShowModal(false)} sx={{ mr: 2 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Đang tải lên..." : "Lưu tài liệu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF List */}
      <div className="row">
        {pdfFiles.map((file) => (
          <div key={file.id} className="col-md-6 mb-4 mt-4">
            <div className="card">
              <div className="card-body">
                <div style={{ height: "600px" }}>
                  <object
                    data={file.url}
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
                  <strong>{file.name}</strong>
                  <button
                    className="btn btn-outline-primary btn-sm w-auto ms-2"
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    Xem
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
