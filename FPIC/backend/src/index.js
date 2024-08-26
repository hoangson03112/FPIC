const express = require("express");
const db = require("./config/db/index");
const app = express();
const cors = require("cors");
const ImageController = require("./Controler/ImageController");

app.use(cors());
app.use(express.json());
db.connect();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.get("/images", ImageController.getImages);
app.listen(9999, () => console.log("Server is running on port 9999"));
