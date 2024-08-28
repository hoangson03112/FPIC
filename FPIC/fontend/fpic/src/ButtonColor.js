import React, { useState } from "react";
import "./ButtonColor.css";

const buttons = [
  { id: "D", label: "D" },
  { id: "R", label: "R" },
  { id: "CR", label: "CR" },
  { id: "RA", label: "RA" },
  { id: "M", label: "M" },
  { id: "T", label: "T" },
  { id: "V", label: "V" },
  { id: "TP", label: "TP" },
  { id: "FB", label: "FB" },
  { id: "S", label: "S" },
  { id: "BTN", label: "BTN" },
  { id: "QA", label: "QA" },
  { id: "C", label: "C" },
  { id: "U", label: "U" },
  { id: "J", label: "J" },
  { id: "L", label: "L" },
  { id: "Q", label: "Q" },
  { id: "P", label: "P" },
  { id: "IC", label: "IC" },
  { id: "RN", label: "RN" },
  { id: "CRA", label: "CRA" },
  { id: "JP", label: "JP" },
  { id: "LED", label: "LED" },
  { id: "F", label: "F" },
  { id: "SW", label: "SW" },
];

function CustomButtonGroup() {
  const [clickedButtons, setClickedButtons] = useState([]);

  const handleClick = (id) => {
    setClickedButtons((prevClicked) =>
      prevClicked.includes(id)
        ? prevClicked.filter((btnId) => btnId !== id)
        : [...prevClicked, id]
    );
  };

  return (
    <div className="button-group">
      {buttons.map((button) => (
        <div
          key={button.id}
          className={`${button.id} ${
            clickedButtons.includes(button.id) ? "faded" : ""
          }`}
          onClick={() => handleClick(button.id)}
        >
          <span></span> {button.label}
        </div>
      ))}
    </div>
  );
}
export default CustomButtonGroup;
