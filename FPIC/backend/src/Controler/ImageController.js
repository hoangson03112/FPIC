const Image = require("../Model/image");

class ImageController {
  async getImages(req, res) {
    try {
      const images = await Image.find();
      res.status(200).json(images);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve images", error: error.message });
    }
  }

  async getImage(req, res) {
    try {
      const image = await Image.findOne({ _id: req.params.id });
      res.status(200).json(image);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve images", error: error.message });
    }
  }
}

module.exports = new ImageController();
