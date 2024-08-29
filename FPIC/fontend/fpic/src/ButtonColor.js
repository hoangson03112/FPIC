import React, { useState, useEffect } from "react";
import "./ButtonColor.css";
import axios from "axios";

function CustomButtonGroup({ fileData }) {
  const [classes, setClasses] = useState([]);
  const [clickedButtons, setClickedButtons] = useState([]);

  useEffect(() => {
    setClickedButtons([]);
    axios
      .get("http://localhost:9999/get-classes")
      .then((response) => {
        setClasses(response.data.jsonData.classes);
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });
  }, [fileData]);

  const handleClick = (id) => {
    setClickedButtons((prevClicked) =>
      prevClicked.includes(id)
        ? prevClicked.filter((btnId) => btnId !== id)
        : [...prevClicked, id]
    );
  };

  const classIds = fileData?.objects?.map((object) => object.classId);

  // Lọc các lớp dựa trên classIds
  const filteredClasses = classes?.filter((classItem) =>
    classIds?.includes(classItem.id)
  );

  return (
    <div className="mt-5">
      <span className="text-body-tertiary ">
        {fileData?.size?.height}x{fileData?.size?.width}
      </span>
      <div className="button-group my-3">
        {filteredClasses.map((button) => (
          <button
            key={button.title}
            className={`button ${
              clickedButtons.includes(button.title) ? "faded" : ""
            }`}
            onClick={() => handleClick(button.title)}
            aria-pressed={
              clickedButtons.includes(button.title) ? "true" : "false"
            }
            style={{ borderColor: button.color, color: button.color }}
          >
            <span style={{ backgroundColor: button.color }}></span>{" "}
            {button.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CustomButtonGroup;
