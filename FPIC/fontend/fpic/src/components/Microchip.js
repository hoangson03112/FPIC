import React, { useEffect, useState } from "react";
import MicrochipItem from "./MicrochipItem";
import axios from "axios";
import "./Microchip.css";
import { REACT_APP_URL_SERVER, REACT_APP_URL_BE } from "../config";

const MicrochipList = () => {
  const [images, setImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    axios
      .get(`${REACT_APP_URL_BE}/images-microchip`)
      .then((response) => {
        setImages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  }, []);

  const handleShowMore = () => {
    setVisibleCount(images.length);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Vi mạch</h2>
      <div className="row">
        {images.slice(0, visibleCount).map((chip, index) => (
          <MicrochipItem key={index} imageURL={chip.img} />
        ))}
      </div>
      {visibleCount < images.length && (
        <span className=" mt-4">
          <button class="learn-more float-end" onClick={handleShowMore}>
            <span class="circle" aria-hidden="true">
              <span class="icon arrow"></span>
            </span>
            <span class="button-text">Thêm</span>
          </button>
        </span>
      )}
    </div>
  );
};

export default MicrochipList;
