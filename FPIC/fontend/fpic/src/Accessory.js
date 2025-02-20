import React, { useState, useEffect } from "react";
import axios from "axios";
import ZoomableImage from "./ZoomableImage";
import "./Accessory.css";
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Pagination, Snackbar, Stack, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Col, Row, Card, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { REACT_APP_URL_SERVER } from "./config";

function Accessory() {
  const [accessories, setAccessories] = useState([]);
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({});
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [snackBar, setSnackBar] = useState({
    open: false,
    message: '',
    severity: ''
  })
  const [dataReponse, setData] = useState({
    status: '',
    message: '',
    data: [],
    pagination: {
      totalPages: '',
      currentPage: '',
      totalItem: ''
    }
  })
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    image: '',
    type: ''
  })
  useEffect(() => {

    fetchData()

  }, [page, limit]);
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("http://localhost:9999/accessory", {
        params: { page: page, limit: limit }
      })
      if (response) {
        setData(response.data)
        setAccessories(response.data.data);
        setIsLoading(false)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, dataReponse.pagination.totalPages)))
  }
  const handleInputChange = (event) => {
    const { name, type } = event.target
    const value = type === "file" ? event.target.files[0] : event.target.value;
    setFormData((prev) => ({
      ...prev, [name]: value
    }))
  }
  const handleClickItem = (index) => {
    const item = accessories[index]
    setFormData((prev) => ({
      ...prev, ...item,
    }))
  }
  const handleClickOnAnotherImage = (index) => {
    setCurrentIndex(index);
  }
  const hanldeClickNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % accessories.length);
  }
  const hanldeClickPreviosImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? accessories.length - 1 : prevIndex - 1);
  }
  const handleSnackbarClose = () => {
    setSnackBar({ open: false, message: '', severity: '' })
  }
  const handleCreateAccessory = async () => {
    setIsLoadingButton(true)
    let form = new FormData()
    form.append("title", formData.title)
    form.append("description", formData.description)
    form.append("type", formData.type)
    form.append("file", formData.image)
    try {
      const response = await axios.post("http://localhost:9999/accessory", form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      if (response) {
        setSnackBar({
          open: true,
          message: `${response.data.message}`,
          severity: 'success'
        })
        fetchData()
        setShowModal(false)
        setFormData((prev) => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: "" })))
        setIsLoadingButton(false)
      }
    } catch (error) {
      setSnackBar({
        open: true,
        message: `Server error: ${error}`,
        severity: 'error'
      })
    }


  }
  return (
    <div className="bg-image">
      <Container fluid>
        <Row>
          <Col className="main-content">
            <div className="App">
              <Col md={2} className="d-flex ms-auto justify-content-end">
                <button class="animated-button" onClick={() => setShowModal(true)}>
                  <svg
                    viewBox="0 0 20 20"
                    className="arr-2 mt-1 "
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                  </svg>
                  <span class="text"> Thêm</span>
                  <span class="circle"></span>
                  <svg
                    viewBox="0 0 20 20"
                    className="arr-1 mt-1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                  </svg>
                </button>
              </Col>
              <div className="table">
                <div>
                  {isLoading ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <div className="image-grid">
                      {accessories.map((image, index) => (
                        <Card
                          key={index}
                          className="m-2"
                          style={{ cursor: "pointer" }}
                          data-bs-toggle="modal"
                          data-bs-target="#imageModal"
                          onClick={() => handleClickItem(index)}
                        >
                          <Card.Img
                            variant="top"
                            src={`data:image/png;base64,${image.image}`}
                            alt={image?.title}
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                            }}
                          />
                          <Card.Body>
                            <Card.Title>{image?.title}</Card.Title>
                            <Card.Text>{image?.description}</Card.Text >
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              <div
                className="modal fade"
                id="imageModal"
                tabIndex="-1"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-fullscreen">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="staticBackdropLabel">
                        {accessories[currentIndex]?.title}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body row">
                      <Col xs={10}>
                        {accessories[currentIndex] && (
                          <div className="d-flex flex-column">
                            <div className="d-flex justify-content-between  mb-3">
                              <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                                <IconButton
                                  onClick={hanldeClickPreviosImage}
                                  sx={{
                                    border:'none',
                                    boxShadow:'none',
                                    "&:hover":{backgroundColor:'transparent'}
                                  }}>
                                  <ChevronLeft
                                    style={{
                                      width: 50,
                                      backgroundColor: "white",
                                      height: 30,
                                      justifyContent: 'center'
                                    }}
                                  />
                                </IconButton>

                                {accessories[currentIndex] ? (
                                  <ZoomableImage
                                    // key={resetKey}
                                    data={`data:image/jpg;base64,${accessories[currentIndex].image}`}
                                    alt={accessories[currentIndex].title}
                                  />
                                ) : (
                                  <p>Không có ảnh</p>
                                )}
                                <IconButton
                                  onClick={hanldeClickNextImage}
                                  sx={{
                                    border:'none',
                                    boxShadow:'none',
                                    "&:hover":{backgroundColor:'transparent'}
                                  }}>
                                  <ChevronRight
                                    style={{
                                      width: 50,
                                      backgroundColor: "white",
                                      height: 30,
                                      justifyContent: 'center'
                                    }}
                                  />
                                </IconButton>
                              </div>
                            </div>

                            <div className="w-100 mt-4">
                              <h6>More images:</h6>
                              <div className="d-flex flex-wrap justify-content-start">
                                {accessories
                                  .map((image, index) => {
                                    return (
                                      <Card
                                        key={index}
                                        className="m-2"
                                        style={{
                                          width: "100px",
                                          cursor: "pointer",
                                          border: accessories[currentIndex] && accessories[currentIndex]._id === image._id ? "3px solid orangered" : "none"
                                        }}
                                        data-bs-target="#imageModal"
                                        onClick={() => handleClickOnAnotherImage(index)}
                                      >
                                        <Card.Img
                                          variant="top"
                                          src={`data:image/jpg;base64,${image.image}`}
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
                      </Col>
                      <Col xs={2}>
                        {/* <CustomButtonGroup fileData={fileData} /> */}
                      </Col>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pagination-footer" style={{
                display: 'flex',
                justifyContent: 'center'
              }}
              >
                <Pagination
                  count={dataReponse.pagination.totalPages}
                  page={dataReponse.pagination.currentPage}
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
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="lg">
        <DialogTitle className="text-center bg-primary text-white">
          Thêm linh kiện
          <IconButton
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: 'white',
              outline: "none",
              boxShadow: "none",
              border: "none",

            }}
            onClick={() => setShowModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ padding: '16px' }}>
            <TextField
              name="title"
              label="Tiêu đề"
              onChange={handleInputChange}
              value={formData.title || ""}
              sx={{ minWidth: "300px" }}
              error={!!errors.title}
              helperText={errors.title}
            />

            <TextField
              name="description"
              label="Mô tả"
              onChange={handleInputChange}
              value={formData.description || ""}
              sx={{ minWidth: "300px" }}
              error={!!errors.description}
              helperText={errors.description}
            />
            <TextField
              name="type"
              label="Loại"
              onChange={handleInputChange}
              value={formData.type || ""}
              sx={{ minWidth: "300px" }}
              error={!!errors.type}
              helperText={errors.type}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(event) => handleInputChange(event)}
              style={{ minWidth: "300px" }}
            />
            <Button onClick={handleCreateAccessory}
              disabled={isLoading}
              startIcon={isLoadingButton
                ? <CircularProgress size={20} color="inherit" />
                : null}>
              Thêm
            </Button>

          </Stack>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackBar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackBar.severity}>
          {snackBar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Accessory;
