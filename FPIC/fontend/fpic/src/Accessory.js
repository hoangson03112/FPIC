import React, { useState, useEffect } from "react";
import axios from "axios";
import ZoomableImage from "./ZoomableImage";
import "./Accessory.css";
import CustomButtonGroup from "./ButtonColor";

import { Col, Row, Card, Container, Modal, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { REACT_APP_URL_SERVER } from "./config";

function Accessory() {
  const { currentPage = 1 } = useParams();
  const navigate = useNavigate();
  const [accessories, setAccessories] = useState([]);
  const [page, setPage] = useState(Number(currentPage));
  const [imagesPerPage] = useState(24);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [fileData, setFileData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const totalPages = Math.ceil(accessories.length / imagesPerPage);
  const indexOfLastImage = page * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = accessories.slice(indexOfFirstImage, indexOfLastImage);
  const selectedImage =
    selectedImageIndex !== null ? accessories[selectedImageIndex] : null;

  // Fetch accessories data on component mount
  useEffect(() => {
    fetchAccessories();
  }, []);

  // Update page state when currentPage param changes
  useEffect(() => {
    setPage(Number(currentPage));
  }, [currentPage]);

  useEffect(() => {
    if (selectedImage) {
      fetchJsonData(selectedImage.name);
    }
  }, [selectedImage]);

  const fetchAccessories = async () => {
    try {
      const response = await axios.get("http://localhost:9999/accessory");
      setAccessories(response.data.data);
    } catch (error) {
      console.error("Error fetching accessories:", error);
    }
  };

  const fetchJsonData = async (fileName) => {
    try {
      const response = await axios.post(
        `${REACT_APP_URL_SERVER}:9999/get-json-file`,
        {
          fileName: fileName,
        }
      );
      setFileData(response.data.jsonData);
    } catch (error) {
      console.error("Error fetching JSON data:", error);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setShowModal(true);
    setResetKey((prevKey) => prevKey + 1);
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      handleImageClick(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < accessories.length - 1) {
      handleImageClick(selectedImageIndex + 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    navigate(`/page/${newPage}`);
  };

  const showPreviousPage = () => {
    if (page > 1) {
      handlePageChange(page - 1);
    }
  };

  const showNextPage = () => {
    if (page < totalPages) {
      handlePageChange(page + 1);
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="bg-image">
      <Container fluid>
        <Row>
          <Col className="main-content">
            <div className="app">
              <div className="image-grid">
                {currentImages.map((image, index) => (
                  <AccessoryCard
                    key={index}
                    image={image}
                    onClick={() => handleImageClick(indexOfFirstImage + index)}
                  />
                ))}
              </div>

              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPrevious={showPreviousPage}
                onNext={showNextPage}
              />

              <Modal
                show={showModal}
                onHide={closeModal}
                centered
                size="xl"
                dialogClassName="modal-90w"
              >
                <Modal.Header
                  closeButton
                  className="bg-primary text-white py-3"
                  style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
                >
                  <Modal.Title className="mx-auto">
                    <h5 className="modal-title">{selectedImage?.name}</h5>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-5">
                  {selectedImage && (
                    <Row>
                      <Col xs={10}>
                        <div className="d-flex flex-column">
                          <div className="d-flex justify-content-between mb-3">
                            <NavigationButton
                              onClick={handlePreviousImage}
                              disabled={selectedImageIndex === 0}
                              direction="prev"
                            />
                            <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                              <ZoomableImage
                                key={resetKey}
                                data={selectedImage}
                              />
                            </div>
                            <NavigationButton
                              onClick={handleNextImage}
                              disabled={
                                selectedImageIndex === accessories.length - 1
                              }
                              direction="next"
                            />
                          </div>

                          <RelatedImages
                            accessories={accessories}
                            selectedImageIndex={selectedImageIndex}
                            handleImageClick={handleImageClick}
                          />
                        </div>
                      </Col>
                      <Col xs={2}>
                        <CustomButtonGroup fileData={fileData} />
                      </Col>
                    </Row>
                  )}
                </Modal.Body>
                <Modal.Footer
                  className="d-flex justify-content-center py-3"
                  style={{ borderRadius: "0 0 0.5rem 0.5rem" }}
                >
                  <Button
                    variant="outline-secondary"
                    className="rounded-pill px-4 py-2"
                    onClick={closeModal}
                  >
                    Hủy
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

const AccessoryCard = ({ image, onClick }) => (
  <Card className="m-2" style={{ cursor: "pointer" }} onClick={onClick}>
    <Card.Img
      variant="top"
      src={`data:image/png;base64,${image.image}`}
      alt={image?.name}
      style={{
        width: "100%",
        height: "150px",
        objectFit: "cover",
      }}
    />
    <Card.Body>
      <Card.Title>{image?.name}</Card.Title>
      <Card.Text>Some quick example text to build on the card title.</Card.Text>
    </Card.Body>
  </Card>
);

const PaginationControls = ({ page, totalPages, onPrevious, onNext }) => (
  <Row className="pagination justify-content-center">
    <Col xs={3}>
      <button
        onClick={onPrevious}
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
        <input type="text" value={page} disabled />/ {totalPages}
      </span>
    </Col>
    <Col xs={3}>
      <button
        onClick={onNext}
        disabled={page === totalPages}
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
);

const NavigationButton = ({ onClick, disabled, direction }) => {
  const icon =
    direction === "prev" ? (
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
    ) : (
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
    );

  return (
    <button
      className="btn btn-custom"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 50,
        backgroundColor: "white",
        height: 30,
      }}
    >
      {icon}
    </button>
  );
};

const RelatedImages = ({
  accessories,
  selectedImageIndex,
  handleImageClick,
}) => (
  <div className="w-100 mt-4">
    <h6>More images:</h6>
    <div className="d-flex flex-wrap justify-content-start">
      {accessories
        .filter((img, index) => index !== selectedImageIndex)
        .slice(0, 19)
        .map((image, index) => (
          <Card
            key={index}
            className="m-2"
            style={{
              width: "100px",
              cursor: "pointer",
            }}
            onClick={() => handleImageClick(accessories.indexOf(image))}
          >
            <Card.Img
              variant="top"
              src={image?.img || `data:image/png;base64,${image.image}`}
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
);

export default Accessory;
