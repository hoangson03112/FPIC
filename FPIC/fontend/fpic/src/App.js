import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import ZoomableImage from "./ZoomableImage";

function App() {
  const [imgs, setImgs] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null); // Lưu trữ ảnh được chọn

  useEffect(() => {
    axios
      .get("http://localhost:9999/images")
      .then((response) => {
        setImgs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleClick = (img) => {
    setSelectedImg(img);
  };
  return (
    <div className="App">
      <div className="d-flex flex-wrap">
        {imgs?.map((img, index) => (
          <a
            key={index}
            onClick={() => handleClick(img)}
            data-bs-toggle="modal"
            data-bs-target="#imageModal"
          >
            <img
              src={img?.img1}
              alt={img?.name}
              className="img-fluid rounded m-3"
              style={{ cursor: "pointer", width: "150px" }}
            />
          </a>
        ))}
      </div>

      <div
        className="modal fade "
        id="imageModal"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen  p-5">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="staticBackdropLabel">
                {selectedImg?.name}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body row">
              <div className="col-9">
                <ZoomableImage data={selectedImg} />
              </div>
              <div className="col-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
