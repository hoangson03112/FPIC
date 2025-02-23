import React, { useEffect, useState } from "react";
import WeakPointItem from "./WeakPointItem";
import axios from "axios";
import "./WeakPoint.css";

const itemsPerPage = 6;
const WeakPoint = () => {
  const [imagesJtag, setImagesJtag] = useState([]);
  const [imagesTestPin, setImagesTestPin] = useState([]);
  const [imagesLPC, setImagesLPC] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesFootprint, setImagesFootprint] = useState([
    {
      name: "Unknown_0.png",
      img: "/footprint/Unknown_0.png",
    },
    {
      name: "Unknown_1.png",
      img: "/footprint/Unknown_1.png",
    },
    {
      name: "Unknown_2.png",
      img: "/footprint/Unknown_2.png",
    },
    {
      name: "Unknown_3.png",
      img: "/footprint/Unknown_3.png",
    },
    {
      name: "Unknown_4.png",
      img: "/footprint/Unknown_4.png",
    },
    {
      name: "Unknown_5.png",
      img: "/footprint/Unknown_5.png",
    },
    {
      name: "Unknown_6.png",
      img: "/footprint/Unknown_6.png",
    },
  ]);
  const [imagesUnusedPort, setImagesUnusedPort] = useState([
    {
      name: "image.png",
      img: "/unused_port/image.png",
    },
    {
      name: "image copy.png",
      img: "/unused_port/image copy.png",
    },
    {
      name: "image copy 4.png",
      img: "/unused_port/image copy 4.png",
    },
    {
      name: "image copy 3.png",
      img: "/unused_port/image copy 3.png",
    },
    {
      name: "image copy 2.png",
      img: "/unused_port/image copy 2.png",
    },
  ]);
  const [imagesVias, setImagesVias] = useState([
    {
      name: "Unknown_0.png",
      img: "/vias/Unknown_0.png",
    },
    {
      name: "Unknown_1.png",
      img: "/vias/Unknown_1.png",
    },
    {
      name: "Unknown_2.png",
      img: "/vias/Unknown_2.png",
    },
    {
      name: "Unknown_3.png",
      img: "/vias/Unknown_3.png",
    },
    {
      name: "Unknown_4.png",
      img: "/vias/Unknown_4.png",
    },
    {
      name: "Unknown_5.png",
      img: "/vias/Unknown_5.png",
    },
    {
      name: "Unknown_6.png",
      img: "/vias/Unknown_6.png",
    },
  ]);
  useEffect(() => {
    axios
      .get("http://localhost:9999/images-jtag")
      .then((response) => {
        setImagesJtag(response.data);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });

    axios
      .get("http://localhost:9999/images-test-pin")
      .then((response) => {
        setImagesTestPin(response.data);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });

    axios
      .get("http://localhost:9999/images-lpc")
      .then((response) => {
        setImagesLPC(response.data);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  }, []);
  const totalPages = Math.ceil(imagesTestPin.length / itemsPerPage);
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  console.log(imagesJtag);

  return (
    <div className="container mt-4">
      <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <button
            class="nav-link active p-3 fs-4 m-0"
            id="nav-home-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-home"
            type="button"
            role="tab"
            aria-controls="nav-home"
            aria-selected="true"
          >
            JTAG
          </button>
          <button
            class="nav-link p-3 fs-4 m-0"
            id="nav-profile-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-profile"
            type="button"
            role="tab"
            aria-controls="nav-profile"
            aria-selected="false"
          >
            TestPin
          </button>
          <button
            class="nav-link p-3 fs-4 m-0"
            id="nav-contact-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-contact"
            type="button"
            role="tab"
            aria-controls="nav-contact"
            aria-selected="false"
          >
            LPC
          </button>
          <button
            class="nav-link p-3 fs-4 m-0"
            id="nav-contact-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-footprint"
            type="button"
            role="tab"
            aria-controls="nav-footprint"
            aria-selected="false"
          >
            Footprint
          </button>{" "}
          <button
            class="nav-link p-3 fs-4 m-0"
            id="nav-contact-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-vias"
            type="button"
            role="tab"
            aria-controls="nav-vias"
            aria-selected="false"
          >
            Vias
          </button>{" "}
          <button
            class="nav-link p-3 fs-4 m-0"
            id="nav-contact-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-unused"
            type="button"
            role="tab"
            aria-controls="nav-unused"
            aria-selected="false"
          >
            Unused ports
          </button>{" "}
          <button
            class="nav-link p-3 fs-4 m-0"
            id="nav-contact-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-spi"
            type="button"
            role="tab"
            aria-controls="nav-spi"
            aria-selected="false"
          >
            SPI
          </button>{" "}
          <button
            class="nav-link p-3 fs-4 m-0"
            id="nav-contact-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-smb"
            type="button"
            role="tab"
            aria-controls="nav-smb"
            aria-selected="false"
          >
            SMB
          </button>
        </div>
      </nav>
      <div className="tab-content mt-4" id="nav-tabContent">
        <div
          class="tab-pane fade show active"
          id="nav-home"
          role="tabpanel"
          aria-labelledby="nav-home-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesJtag.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="nav-profile"
          role="tabpanel"
          aria-labelledby="nav-profile-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesTestPin.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="nav-contact"
          role="tabpanel"
          aria-labelledby="nav-contact-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesLPC.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="nav-footprint"
          role="tabpanel"
          aria-labelledby="nav-contact-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesFootprint.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>
        <div
          class="tab-pane fade"
          id="nav-vias"
          role="tabpanel"
          aria-labelledby="nav-contact-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesVias.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>{" "}
        <div
          class="tab-pane fade"
          id="nav-unused"
          role="tabpanel"
          aria-labelledby="nav-contact-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesUnusedPort.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>{" "}
        <div
          class="tab-pane fade"
          id="nav-spi"
          role="tabpanel"
          aria-labelledby="nav-contact-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesLPC.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>{" "}
        <div
          class="tab-pane fade"
          id="nav-smb"
          role="tabpanel"
          aria-labelledby="nav-contact-tab"
          tabindex="0"
        >
          <div className="row">
            {imagesTestPin.map((chip, index) => (
              <WeakPointItem key={index} imageURL={chip.img} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeakPoint;
