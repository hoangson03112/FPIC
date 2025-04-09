import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Modal,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Pagination,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Stack,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Warning,
  Search,
  Close,
  CloudUpload,
  Category,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { REACT_APP_URL_BE } from "../config";

// Custom styled components
const GradientHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
  color: "white",
  textAlign: "center",
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(3),
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    height: 4,
    borderRadius: "2px 2px 0 0",
  },
});

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

const WeakPoint = () => {
  // State declarations (keep the same)
  const [categories, setCategories] = useState({
    jtag: [],
    testPin: [],
    lpc: [],
    footprint: [],
    unusedPort: [],
    vias: [],
    spi: [],
    smb: [],
  });
  const [activeTab, setActiveTab] = useState("jtag");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [nameError, setNameError] = useState(""); // Thêm state để lưu lỗi tên

  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    // description: "",
    imageURL: "",
    category: "jtag",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data (keep the same)
  useEffect(() => {
    setIsLoading(true);
    const endpoints = [
      { key: "jtag", url: "http://localhost:9999/images-jtag" },
      { key: "testPin", url: "http://localhost:9999/images-test-pin" },
      { key: "lpc", url: "http://localhost:9999/images-lpc" },
      { key: "footprint", url: "http://localhost:9999/images-footprint" },
      { key: "unusedPort", url: "http://localhost:9999/images-unused-port" },
      { key: "vias", url: "http://localhost:9999/images-vias" },
      { key: "spi", url: "http://localhost:9999/images-spi" },
      { key: "smb", url: "http://localhost:9999/images-smb" },
    ];

    const fetchAllData = async () => {
      try {
        const newCategories = { ...categories };
        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(endpoint.url);
            newCategories[endpoint.key] = response.data.map((item) => ({
              ...item,
              id: item.id || Math.random().toString(36).substr(2, 9),
            }));
          } catch (err) {
            console.error(`Error fetching ${endpoint.key} data:`, err);
          }
        }
        setCategories(newCategories);
        setIsLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter items based on search term
  const filteredItems = (categories[activeTab] || []).filter(
    (item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    // ||item.description?.toLowerCase().includes(searchTerm.toLowerCase()
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // CRUD handlers (keep the same)
  const handleAddItem = () => {
    setModalMode("add");
    setFormData({
      name: "",
      // description: "",
      imageURL: "",
      category: activeTab,
    });
    setNameError(""); // Reset name error when opening modal
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      // description: item.description || "",
      category: activeTab,
    });
    setNameError(""); // Reset name error when opening modal
    setImagePreview(null); // Reset image preview
    setImageFile(null); // Reset image file
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setModalMode("delete");
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm kiểm tra tên đã tồn tại chưa
  const checkNameExists = (name, category, currentItemId = null) => {
    return categories[category].some(
      (item) =>
        item.name?.toLowerCase() === name.toLowerCase() &&
        (currentItemId === null || item.id !== currentItemId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Xóa khoảng trắng ở đầu và cuối tên
    const trimmedName = formData.name.trim();

    // Kiểm tra tên trống
    if (trimmedName === "") {
      setNameError("Tên không được để trống");
      return;
    }

    // Kiểm tra tên đã tồn tại chưa
    const currentItemId = modalMode === "edit" ? selectedItem.id : null;
    if (checkNameExists(trimmedName, formData.category, currentItemId)) {
      setNameError("Tên này đã tồn tại trong danh mục, vui lòng chọn tên khác");
      return;
    }

    try {
      let imageUrl = selectedItem?.img || "";

      if (modalMode === "add") {
        // Kiểm tra xem đã chọn hình ảnh chưa
        if (!imageFile) {
          setError("Vui lòng chọn hình ảnh cho thành phần mới");
          return;
        }

        let form = new FormData();
        form.append("image", imageFile);
        form.append("name", trimmedName); // Sử dụng tên đã trim
        form.append("category", formData.category);

        const response = await axios.post(
          `${REACT_APP_URL_BE}/uploadWeakPoint`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        setCategories((prev) => ({
          ...prev,
          [formData.category]: [...prev[formData.category], response.data],
        }));
      } else if (modalMode === "edit") {
        const updatedItem = {
          ...selectedItem,
          name: trimmedName, // Sử dụng tên đã trim
          // description: formData.description,
          img: imageUrl || selectedItem.img,
          category: formData.category,
        };
        // await axios.put(`${apiEndpoint}/${selectedItem.id}`, updatedItem);
        setCategories((prev) => ({
          ...prev,
          [formData.category]: prev[formData.category].map((item) =>
            item.id === selectedItem.id ? updatedItem : item
          ),
        }));
      } else if (modalMode === "delete") {
        await axios.delete(`${REACT_APP_URL_BE}/deleteWeakPoint`, {
          data: {
            category: activeTab,
            img: selectedItem.img,
          },
        });

        setCategories((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].filter(
            (item) => item.img !== selectedItem.img
          ),
        }));
      }

      setIsModalOpen(false);
      setSelectedItem(null);
      setImageFile(null);
      setImagePreview(null);
      setNameError(""); // Reset name error
    } catch (err) {
      console.error("Operation failed:", err);
      setError("Thao tác thất bại. Vui lòng thử lại.");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Kiểm tra lỗi tên khi người dùng nhập
    if (name === "name") {
      if (value.trim() === "") {
        setNameError("Tên không được để trống");
      } else if (
        checkNameExists(
          value,
          formData.category,
          modalMode === "edit" ? selectedItem.id : null
        )
      ) {
        setNameError(
          "Tên này đã tồn tại trong danh mục, vui lòng chọn tên khác"
        );
      } else {
        setNameError("");
      }
    }
  };

  // Category display names
  const categoryNames = {
    jtag: "JTAG",
    testPin: "Test Pin",
    lpc: "LPC",
    footprint: "Footprint",
    unusedPort: "Unused Port",
    vias: "Vias",
    spi: "SPI",
    smb: "SMB",
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header with gradient */}
      <GradientHeader>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Điểm Yếu Trên Bo Mạch
        </Typography>
      </GradientHeader>

      {/* Main Content */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden", mb: 4 }}>
        {/* Tabs with improved styling */}
        <Box sx={{ bgcolor: "background.paper" }}>
          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            {Object.keys(categories).map((category) => (
              <StyledTab
                key={category}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Category fontSize="small" />
                    <span>{categoryNames[category]}</span>
                    <Chip
                      label={categories[category].length}
                      size="small"
                      color="primary"
                      sx={{ borderRadius: 1 }}
                    />
                  </Stack>
                }
                value={category}
              />
            ))}
          </StyledTabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 3 }}>
          {/* Action Bar with Search and Add */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              <Box component="span" color="primary.main">
                {categoryNames[activeTab]}
              </Box>
              <Box component="span" sx={{ ml: 1, color: "text.secondary" }}>
                ({filteredItems.length} items)
              </Box>
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <TextField
                size="small"
                placeholder="Tìm kiếm..."
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Close fontSize="small" />
                    </IconButton>
                  ),
                }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{
                  width: { xs: "100%", sm: 300 },
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddItem}
                sx={{ borderRadius: 2 }}
              >
                Thêm Mới
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress color="primary" size={60} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Đang tải dữ liệu...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Items Grid */}
              {displayedItems.length > 0 ? (
                <Grid container spacing={3}>
                  {displayedItems.map((item, index) => {
                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        key={item.id || index}
                      >
                        <CategoryCard>
                          <Box sx={{ position: "relative" }}>
                            <CardMedia
                              component="img"
                              height="180"
                              image={`${REACT_APP_URL_BE}${item.img}`}
                              alt={`${REACT_APP_URL_BE}${item.img}`}
                              sx={{
                                objectFit: "contain",
                                p: 2,
                                cursor: "pointer",
                                bgcolor: "background.default",
                              }}
                              onClick={() => handleViewItem(item)}
                            />
                            <Chip
                              label={categoryNames[activeTab]}
                              size="small"
                              color="primary"
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{ fontWeight: 600 }}
                            >
                              {item.name || `Thành phần ${index + 1}`}
                            </Typography>
                          </CardContent>
                          <Divider />
                          <CardActions
                            sx={{ justifyContent: "space-between", p: 1.5 }}
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                color="info"
                                onClick={() => handleViewItem(item)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Sửa">
                                <IconButton
                                  color="secondary"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteItem(item)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </CardActions>
                        </CategoryCard>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Search
                    sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {searchTerm
                      ? "Không tìm thấy kết quả"
                      : "Không có thành phần nào"}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {searchTerm
                      ? "Hãy thử với từ khóa khác hoặc xóa bộ lọc tìm kiếm"
                      : "Bạn có muốn thêm thành phần đầu tiên cho danh mục này không?"}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddItem}
                    sx={{ borderRadius: 2 }}
                  >
                    Thêm thành phần
                  </Button>
                </Box>
              )}

              {/* Pagination */}
              {filteredItems.length > 0 && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  sx={{ mt: 4 }}
                >
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Số mục/trang</InputLabel>
                    <Select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value={8}>8</MenuItem>
                      <MenuItem value={16}>16</MenuItem>
                      <MenuItem value={24}>24</MenuItem>
                      <MenuItem value={48}>48</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">
                    Hiển thị {startIndex + 1}-
                    {Math.min(startIndex + itemsPerPage, filteredItems.length)}{" "}
                    / {filteredItems.length} mục
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    sx={{ "& .MuiPaginationItem-root": { borderRadius: 1 } }}
                  />
                </Stack>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setImagePreview(null);
          setImageFile(null);
          setNameError(""); // Reset name error
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: 500, md: 600 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            outline: "none",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {modalMode === "add"
                ? "Thêm Thành Phần Mới"
                : modalMode === "edit"
                ? "Chỉnh Sửa Thành Phần"
                : modalMode === "delete"
                ? "Xác Nhận Xóa"
                : "Chi Tiết Thành Phần"}
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {modalMode === "delete" ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Warning color="error" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Xác nhận xóa điểm yếu?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Bạn đang xóa điểm yếu <strong>"{selectedItem?.name}"</strong>.
                  Hành động này không thể hoàn tác.
                </Typography>
              </Box>
            ) : modalMode === "view" ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                    bgcolor: "background.default",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={`${REACT_APP_URL_BE}${selectedItem.img}`}
                    alt={selectedItem?.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                          Tên
                        </TableCell>
                        <TableCell>
                          {selectedItem?.name || "Không có tên"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Danh mục
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={categoryNames[activeTab]}
                            color="primary"
                            size="small"
                            avatar={<Category fontSize="small" />}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Tên thành phần"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    size="small"
                    error={!!nameError}
                    helperText={nameError}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />

                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<CloudUpload />}
                      sx={{ borderRadius: 2 }}
                    >
                      Tải lên hình ảnh
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                    {modalMode === "add" && !imagePreview && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", mt: 1 }}
                      >
                        Vui lòng chọn hình ảnh cho thành phần
                      </Typography>
                    )}
                    {(imagePreview ||
                      (modalMode === "edit" &&
                        selectedItem?.img &&
                        !imagePreview)) && (
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Xem trước:
                        </Typography>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <img
                            src={
                              imagePreview ||
                              `${REACT_APP_URL_BE}${selectedItem.img}`
                            }
                            alt="Preview"
                            style={{
                              maxWidth: "100%",
                              maxHeight: 150,
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </form>
            )}
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              textAlign: "right",
            }}
          >
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setIsModalOpen(false);
                  setNameError("");
                }}
                sx={{ borderRadius: 2 }}
              >
                {modalMode === "view" ? "Đóng" : "Hủy"}
              </Button>
              {modalMode !== "view" && (
                <Button
                  variant="contained"
                  color={modalMode === "delete" ? "error" : "primary"}
                  onClick={handleSubmit}
                  startIcon={
                    modalMode === "delete" ? <Delete /> : <CloudUpload />
                  }
                  disabled={
                    (modalMode !== "delete" &&
                      (!!nameError || formData.name.trim() === "")) ||
                    (modalMode === "add" && !imageFile)
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {modalMode === "add"
                    ? "Thêm"
                    : modalMode === "edit"
                    ? "Lưu"
                    : "Xóa"}
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default WeakPoint;
