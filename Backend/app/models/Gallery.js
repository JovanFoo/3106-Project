const mongose = require("mongoose");
const Schema = mongose.Schema;

const GallerySchema = new Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
const Gallery = mongose.model("Gallery", GallerySchema);
module.exports = Gallery;
