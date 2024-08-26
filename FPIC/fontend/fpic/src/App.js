import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [imgs, setImgs] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:9999/images")
      .then((response) => {
        console.log("Data received:", response);
        setImgs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  return (
    <div className="App">
      <div className="d-flex">
        {imgs?.map((img, index) => {
          return (
            <a key={index}>
              <img
                src={img.img1}
                alt={img.name}
                className="img-fluid rounded m-3"
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default App;
