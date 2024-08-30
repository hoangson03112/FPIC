import React, { useState, useEffect } from "react";
import axios from "axios";
import ZoomableImage from "./ZoomableImage";
import "./App.css";
import CustomButtonGroup from "./ButtonColor";
import Header from "./elements/Header";
import { Col, Row, Button, Card } from "react-bootstrap";

function App() {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [imagesPerPage] = useState(24); // Số lượng ảnh mỗi trang
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [resetKey, setResetKey] = useState(0); // Reset ảnh khi chuyển ảnh
  const [fileData, setFileData] = useState(null);

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

  // Tính toán vị trí bắt đầu và kết thúc của ảnh cho trang hiện tại
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setResetKey((prevKey) => prevKey + 1); // Tăng key để reset ZoomableImage khi ảnh thay đổi
  };

  const showPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const showNextPage = () => {
    if (currentPage < Math.ceil(images.length / imagesPerPage)) {
      setCurrentPage(currentPage + 1);
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

  return (
    <div className="bg-image">
      <Header />
      <div className="App">
        <div className="image-grid">
          {currentImages.map((image, index) => (
            <Card
              key={index}
              className="m-2"
              style={{ cursor: "pointer" }}
              onClick={() => handleImageClick(indexOfFirstImage + index)}
              data-bs-toggle="modal"
              data-bs-target="#imageModal"
            >
              <Card.Img
                variant="top"
                src={image?.img1}
                alt={image?.name}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>{image?.name}</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title.
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>

        {/* Phân trang */}
        <Row className="pagination">
          <Button
            onClick={showPreviousPage}
            disabled={currentPage === 1}
            className="btn"
            style={{ width: 150 }}
          >
            Trang trước
          </Button>
          <span>
            Trang
            <input
              type="text"
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              onBlur={() => {
                if (currentPage < 1) setCurrentPage(1);
                if (currentPage > Math.ceil(images.length / imagesPerPage))
                  setCurrentPage(Math.ceil(images.length / imagesPerPage));
              }}
              disabled
            />
            / {Math.ceil(images.length / imagesPerPage)}
          </span>
          <Button
            onClick={showNextPage}
            disabled={currentPage === Math.ceil(images.length / imagesPerPage)}
            className="btn"
            style={{ width: 150 }}
          >
            Trang sau
          </Button>
        </Row>

        {/* Modal hiển thị ảnh */}
        <div
          className="modal fade"
          id="imageModal"
          tabIndex="-1"
          aria-labelledby="staticBackdropLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-fullscreen p-5 pb-0">
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
                      <div className="d-flex justify-content-center align-items-center mb-3">
                        <ZoomableImage key={resetKey} data={selectedImage} />
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
                                style={{ width: "100px", cursor: "pointer" }}
                                onClick={() =>
                                  handleImageClick(images.indexOf(image))
                                }
                                data-bs-target="#imageModal"
                              >
                                <Card.Img
                                  variant="top"
                                  src={image?.img1}
                                  alt={image?.name}
                                  style={{ width: "100%" }}
                                />
                                <Card.Body>
                                  <Card.Title>{image?.name}</Card.Title>
                                  <Card.Text>
                                    Some quick example text to build on the card
                                    title.
                                  </Card.Text>
                                </Card.Body>
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
    </div>
  );
}

export default App;
