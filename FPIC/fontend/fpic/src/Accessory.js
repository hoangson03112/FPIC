import React, { useState, useEffect } from "react";
import axios from "axios";
import ZoomableImage from "./ZoomableImage";
import "./Accessory.css";
import {
  Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Pagination, Snackbar,
  Stack, TextField, Fade,
  Autocomplete
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { ChevronLeft, ChevronRight, Search } from "@mui/icons-material";
import { Col, Row, Card, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { REACT_APP_URL_SERVER, REACT_APP_URL_BE } from "./config";
import SearchBox from "./components/SearchBox";
const Transition = React.forwardRef((props, ref) => <Fade ref={ref} {...props} timeout={700} />)
function Accessory() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [pageAccessory, setPageAccessory] = useState(1)
  const [limitAccessory, setLimitAccessory] = useState(12)
  const [showModal, setShowModal] = useState(false)
  const [showModalDesc, setShowModalDesc] = useState(false)
  const [errors, setErrors] = useState({});
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [currentIndex, setCurrentIndex] = useState()
  const [search, setSearch] = useState()
  const [snackBar, setSnackBar] = useState({
    open: false,
    message: '',
    severity: ''
  })
  const [data, setData] = useState({
    typesAccessories: [],
    accessories: [],
    pagination: { totalPages: 0, currentPage: 1, totalItem: 0 },
    pagination_access: { totalPages: 0, currentPage: 1, totalItem: 0 },
    isLoading: false,
    error: null,
  });
  const [formType, setFormType] = useState({
    _id:'',
    title:'',
    image:'',
    contentType:''
  }) 
  const [formAccessory, setFormAccessory] = useState({
    _id: "",
    tilte: "",
    image: "",
    type: "",
    description: ""
  })
  useEffect(() => {

    fetchData()

  }, [page, limit, search]);

  useEffect(() => {
    const item = data.accessories[currentIndex]
    setFormAccessory({ ...item })
  }, [currentIndex])

  useEffect(()=>{
    fetchAccessories()
  },[limitAccessory, formType])

  const fetchData = async () => {
    setData((prev) =>({...prev, isLoading: true}))
    const controller = new AbortController();
    try {
      const response = await axios.get(`${REACT_APP_URL_BE}/get-types-accessory`, {
        params: { page: page, limit: limit, query: search },
        signal: controller.signal,
      })
      if (response) {
        setData(prev =>({
          ...prev,
          typesAccessories:response.data.data,
          pagination: response.data.pagination,
          isLoading: false
        }))
      }
    } catch (error) {
      console.log(error)
      setData((prev) => ({ ...prev, error }));
      setSnackBar({
        open: true,
        message: error,
        severity: "error"
      })
    }
    return () => controller.abort();
  }
  const fetchAccessories = async () => {
    const controller = new AbortController()
    try {
      const response = await axios.get(`${REACT_APP_URL_BE}/accessory`, {
        params: { page: pageAccessory, limit: limitAccessory, type: formType._id },
        signal: controller.signal
      })
      if (response) {
        setData(prev => ({
          ...prev,
          accessories: response.data.data,
          pagination_access: response.data.pagination
        }))
        setFormAccessory({ ...response.data.data[0] })
      }
    } catch (error) {
      console.log(error)
      setData((prev) => ({ ...prev, error }));
      setSnackBar({
        open: true,
        message: error,
        severity: "error"
      })
    }
    return () => controller.abort()
  }
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, data.pagination.totalPages)))
  }
  const handleInputChange = (event) => {
    const { name, type, value, files } = event.target
    setFormType((prev) => ({
      ...prev, [name]: type === 'file' ? files[0] : value
    }))
  }
  const handleClickItem = (type, index) => {
    setFormType({...type})
    handleClickModalDesc(true)
  }
  const handleClickOnAnotherImage = (index) => {
    setCurrentIndex(index);
  }
  const hanldeClickNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.accessories.length);
  }
  const hanldeClickPreviosImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? data.accessories.length - 1 : prevIndex - 1);
  }
  const handleSnackbarClose = () => {
    setSnackBar({ open: false, message: '', severity: '' })
  }
  const handleClickModalDesc = (status) => {
    if (status) {
      setShowModalDesc(status)
    } else {
      setShowModalDesc(status)
      setFormAccessory({ ...data.accessories[currentIndex] })
    }
  }
   const handleCreateAccessory = async () => {
  //   setIsLoadingButton(true)
  //   let form = new FormData()
  //   form.append("title", formData.title)
  //   form.append("description", formData.description ?? "")
  //   form.append("type", formData.type)
  //   form.append("file", formData.image)
  //   try {
  //     const response = await axios.post(`${REACT_APP_URL_BE}/accessory`, form, {
  //       headers: { "Content-Type": "multipart/form-data" }
  //     })
  //     if (response) {
  //       setSnackBar({
  //         open: true,
  //         message: `${response.data.message}`,
  //         severity: 'success'
  //       })
  //       fetchData()
  //       setShowModal(false)
  //       setFormData((prev) => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: "" })))
  //       setIsLoadingButton(false)
  //     }
  //   } catch (error) {
  //     setSnackBar({
  //       open: true,
  //       message: `Server error: ${error}`,
  //       severity: 'error'
  //     })
  //   }


   }
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
   }
  const handleResultSearch = (result) => {
    setSearch(result)
  }
  const handleCreateType = async () =>{
    setIsLoadingButton(true)
    console.log(formType)
    try {
      if(formType.title.length === 0) {
        setErrors(error => ({...error, title:"Chưa nhập tên loại"}))
        return
      }
      if(formType.image.length === 0) {
        setErrors(error => ({...error, title:"Chưa chọn ảnh"}))
        return
      }
      let form = new FormData()
        form.append("title",formType.title)
        form.append("contentType", formType.contentType)
        form.append("file",formType.image)
      
      const response = await axios.post(`${REACT_APP_URL_BE}/types-accessory`,form,{
        headers: { "Content-Type": "multipart/form-data" }
      })
      if(response){
        setSnackBar({
          open: true,
          message:"Tạo thành công",
          severity:"success"
        })
        fetchData()
        setShowModal(false)
      }
    } catch (error) {
      console.log(error)
      setSnackBar({
        open: true,
        message:"Thêm thất bại - Loại đã tồn tại",
        severity:"error"
      })
    }finally{
      setIsLoadingButton(false)
    }
  }
  const handleDownMoreImage =() =>{
    setLimitAccessory((prev) => prev + 12)
  } 
  const handleUpMoreImage =() =>{
    setLimitAccessory((prev) => prev - 12)
  }
  return (
    <div className="bg-image">
      <Container fluid>
        <Row>
          <Col className="main-content">
            <div className="App">
              <div className="d-flex ms-auto justify-content-center">
                <SearchBox
                  className="justify-content-center"
                  onSearchChange={handleResultSearch} />
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
              </div>

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
                          onClick={() => handleClickItem(type,index)}
                        >
                          <Card.Img
                            variant="top"
                            src={`${REACT_APP_URL_BE}${atob(type.image)}`}
                            alt={type?.title}
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                            }}
                          />
                          <Card.Body>
                            <Card.Title>{type?.title}</Card.Title>
                            <Card.Text>{type?.description}</Card.Text >
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="pagination-footer" style={{
                display: 'flex',
                justifyContent: 'center'
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
        TransitionComponent={Transition}>
        <DialogTitle sx={{ paddingTop: '10px', paddingBottom: '0px', paddingLeft: '0px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconButton
              sx={{
                border: 'none',
                boxShadow: 'none',
                "&:hover": { backgroundColor: 'transparent' },
              }}
              onClick={() => handleClickModalDesc(false)}>
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
                        border: 'none',
                        boxShadow: 'none',
                        "&:hover": { backgroundColor: 'transparent' }
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

                    {formAccessory.image ? (
                      <ZoomableImage
                        // key={resetKey}
                        data={`${REACT_APP_URL_BE}${atob(formAccessory.image)}`}
                        alt={formAccessory.title}
                      />
                    ) : (
                      <p>Không có ảnh</p>
                    )}
                    <IconButton
                      onClick={hanldeClickNextImage}
                      sx={{
                        border: 'none',
                        boxShadow: 'none',
                        "&:hover": { backgroundColor: 'transparent' }
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
                  <Stack
                    spacing={4}
                    sx={{ padding: '16px', marginTop: '50px' }}
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
                    <Autocomplete
                      options={data.typesAccessories}
                      value={data.typesAccessories.find((item) => item._id === formAccessory.type) || null}
                      getOptionLabel={(option) =>option.title}
                      renderInput={(params) => <TextField {...params} label="Loại"/>}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      disableClearable/>

                    <div style={{ display: 'flex', justifyContent: 'space-evenly', }}>
                      <Button onClick={handleUpdateAccessory}
                        disabled={isLoadingButton}
                        startIcon={isLoadingButton
                          ? <CircularProgress size={20} color="inherit" />
                          : null}>
                        Sửa
                      </Button>
                      <Button
                        disabled={isLoadingButton}
                        color="warning"
                        startIcon={isLoadingButton
                          ? <CircularProgress size={20} color="inherit" />
                          : null}>
                        Xóa
                      </Button>
                    </div>
                  </Stack>
                </div>

                <div className="w-100 mt-4">
                  <div style={{display:"flex"}}>
                    <h6 style={{marginRight:"10px", marginBottom:"0px", alignContent:'center'}}>More images:</h6>
                    <IconButton style={{width:"30px", height:"30px", boxShadow:"none"}}
                        onClick={handleUpMoreImage}>
                      <ArrowUpwardIcon/>
                    </IconButton>
                    <IconButton style={{width:"30px", height:"30px", boxShadow:"none"}}
                        onClick={handleDownMoreImage}>
                      <ArrowDownwardIcon/>
                    </IconButton>
                    
                  </div>
                  <div className="more-image">
                    {data.accessories
                      .map((image, index) => {
                        return (
                          <Card
                            key={index}
                            className="m-2"
                            style={{
                              width: "100px",
                              cursor: "pointer",
                              border: formAccessory && formAccessory._id === image._id ? "3px solid orangered" : "none"
                            }}
                            data-bs-target="#imageModal"
                            onClick={() => handleClickOnAnotherImage(index)}
                          >
                            <Card.Img
                              variant="top"
                              src={`${REACT_APP_URL_BE}${atob(image.image)}`}
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
        maxWidth="lg"
        TransitionComponent={Transition}>
        <DialogTitle className="text-center bg-primary text-white">
          Thêm loại linh kiện
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
              sx={{ minWidth: "300px" }}
              error={!!errors.title}
              helperText={errors.title}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
              style={{ minWidth: "300px" }}
            />
            <Button onClick={handleCreateType}
              disabled={isLoadingButton}
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
        onClose={handleSnackbarClose}
        TransitionComponent={Transition}>
        <Alert onClose={handleSnackbarClose} severity={snackBar.severity}>
          {snackBar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Accessory;
