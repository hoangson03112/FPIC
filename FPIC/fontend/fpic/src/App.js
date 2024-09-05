import React, { useState, useEffect } from "react";
import axios from "axios";
import ZoomableImage from "./ZoomableImage";
import "./App.css";
import CustomButtonGroup from "./ButtonColor"; // Đảm bảo đúng tên và đường dẫn
import Header from "./elements/Header";
import { Col, Row, Card, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import ScrollToTopButton from "./elements/ScrollToTopButton"; // Đảm bảo đúng tên và đường dẫn
import { formatDistanceToNow, parseISO } from "date-fns";

function App() {
  const { currentPage = 1 } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(Number(currentPage));
  const [imagesPerPage] = useState(24);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [fileData, setFileData] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [classes, setClasses] = useState([]); // Thêm dòng này

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      handleImageClick(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < images.length - 1) {
      handleImageClick(selectedImageIndex + 1);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:9999/images")
      .then((response) => {
        setImages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:9999/get-classes")
      .then((response) => {
        setClasses(response.data.jsonData.classes);
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });
  }, []);

  const classIds = fileData?.objects?.map((object) => object.classId);
  const filteredClasses = classes?.filter((classItem) =>
    classIds?.includes(classItem.id)
  );
  console.log(classes);

  const indexOfLastImage = page * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

  const [likedImages, setLikedImages] = useState(
    Array(images.length).fill(false)
  );

  const toggleLike = (index) => {
    const newLikedImages = [...likedImages];
    newLikedImages[index] = !newLikedImages[index];
    setLikedImages(newLikedImages);
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setResetKey((prevKey) => prevKey + 1);
  };

  const showPreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      navigate(`/home/page/${newPage}`);
    }
  };

  const showNextPage = () => {
    if (page < Math.ceil(images.length / imagesPerPage)) {
      const newPage = page + 1;
      setPage(newPage);
      navigate(`/home/page/${newPage}`);
    }
  };

  const selectedImage = images[selectedImageIndex];

  useEffect(() => {
    if (selectedImage) {
      axios
        .post("http://localhost:9999/get-json-file", {
          fileName: selectedImage.name,
        })
        .then((response) => {
          setFileData(response.data.jsonData);
        })
        .catch((error) => {
          console.error("Error fetching images:", error);
        });
    }
  }, [selectedImage]);

  useEffect(() => {
    setPage(Number(currentPage));
  }, [currentPage]);

  return (
    <div className="bg-image">
      <Header onToggleMenu={toggleMenu} />
      <div className={`side-menu ${isMenuOpen ? "open" : "closed"}`}>
        <div>Menu Content</div>
      </div>
      <Container fluid>
        <Row>
          <Col className={`main-content ${isMenuOpen ? "shrinked" : ""}`}>
            <div className="App">
              <div className="image-grid">
                {currentImages.map((image, index) => {
                  let createdAt;
                  try {
                    if (fileData?.objects?.createdAt) {
                      console.log("Raw createdAt value:", image.createdAt);
                      createdAt = parseISO(image.createdAt);
                      console.log("Parsed createdAt value:", createdAt);
                    }
                  } catch (error) {
                    console.error("Invalid date format:", image?.createdAt);
                    createdAt = null;
                  }

                  return (
                    <Card key={index} className="m-2">
                      <Card.Img
                        variant="top"
                        src={image?.img1}
                        alt={image?.name}
                        data-bs-toggle="modal"
                        data-bs-target="#imageModal"
                        onClick={() => handleImageClick(index)}
                        style={{
                          cursor: "pointer",
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                      <Card.Body>
                        <Card.Title>{image?.name}</Card.Title>
                        <Card.Text>
                          {createdAt
                            ? `Đã đăng: ${formatDistanceToNow(createdAt, {
                                addSuffix: true,
                              })}`
                            : "Ngày đăng không hợp lệ"}
                        </Card.Text>
                        <Card.Text>
                          Some quick example text to build on the card title.
                        </Card.Text>
                        <button
                          className={`btnn ${
                            likedImages[index]
                              ? "btn-success"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => toggleLike(index)}
                        >
                          {likedImages[index] ? "Đã thích" : "Thích"}
                        </button>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
              <Row className="pagination justify-content-center">
                <Col xs={3}>
                  <button
                    onClick={showPreviousPage}
                    disabled={page === 1}
                    className="btn btn-custom"
                    style={{ width: 50, backgroundColor: "white", height: 30 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-chevron-double-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                      />
                      <path
                        fillRule="evenodd"
                        d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                      />
                    </svg>
                  </button>
                </Col>
                <Col xs={3}>
                  <span>
                    Trang
                    <input
                      type="text"
                      value={page}
                      onChange={(e) => setPage(Number(e.target.value))}
                      onBlur={() => {
                        if (page < 1) setPage(1);
                        if (page > Math.ceil(images.length / imagesPerPage))
                          setPage(Math.ceil(images.length / imagesPerPage));
                      }}
                      disabled
                    />
                    / {Math.ceil(images.length / imagesPerPage)}
                  </span>
                </Col>
                <Col xs={3}>
                  <button
                    onClick={showNextPage}
                    disabled={page === Math.ceil(images.length / imagesPerPage)}
                    className="btn btn-custom"
                    style={{ width: 50, backgroundColor: "white", height: 30 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-chevron-double-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"
                      />
                      <path
                        fillRule="evenodd"
                        d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"
                      />
                    </svg>
                  </button>
                </Col>
              </Row>
              <ScrollToTopButton /> {/* Đảm bảo đúng tên và đường dẫn */}
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
                        {selectedImage?.name}
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
                        {selectedImage && (
                          <div className="d-flex flex-column">
                            <div className="d-flex flex-row justify-content-between align-items-center mb-3">
                              <button
                                className="btn btn-custom"
                                onClick={handlePreviousImage}
                                disabled={selectedImageIndex === 0}
                                style={{
                                  width: 50,
                                  backgroundColor: "white",
                                  height: 30,
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-chevron-double-left"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                                  />
                                </svg>
                              </button>
                              <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                                {selectedImage && (
                                  <ZoomableImage
                                    key={resetKey}
                                    data={selectedImage}
                                  />
                                )}
                              </div>
                              <button
                                className="btn btn-custom"
                                onClick={handleNextImage}
                                disabled={
                                  selectedImageIndex === images.length - 1
                                }
                                style={{
                                  width: 50,
                                  backgroundColor: "white",
                                  height: 30,
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  className="bi bi-chevron-double-right"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"
                                  />
                                </svg>
                              </button>
                            </div>

                            <div className="w-100 mt-4">
                              <h6>More images:</h6>
                              <div className="d-flex flex-wrap justify-content-start">
                                {images
                                  .filter(
                                    (img, index) => index !== selectedImageIndex
                                  )
                                  .slice(0, 19)
                                  .map((image, index) => (
                                    <Card
                                      key={index}
                                      className="m-2"
                                      style={{
                                        width: "100px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        handleImageClick(images.indexOf(image))
                                      }
                                      data-bs-target="#imageModal"
                                    >
                                      <Card.Img
                                        variant="top"
                                        src={image?.img1}
                                        alt={image?.name}
                                        style={{
                                          width: "100%",
                                          height: "100px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </Card>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </Col>
                      <Col xs={2}>
                        <CustomButtonGroup fileData={fileData} />
                      </Col>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
