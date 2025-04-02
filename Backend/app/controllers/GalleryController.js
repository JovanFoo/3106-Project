const Gallery = require("../models/Gallery.js");
const Stylist = require("../models/Stylist.js");
const GalleryController = {
  // Create a new gallery
  async create(req, res) {
    console.log("GalleryController > create");
    const { title, image } = req.body;
    const stylistId = req.userId;
    if (!stylistId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!title || !image) {
      return res.status(400).json({ message: "Missing title or image" });
    }
    const stylist = await Stylist.findById(stylistId);
    if (!stylist) {
      return res.status(404).json({ message: "Stylist not found" });
    }

    try {
      const gallery = new Gallery({
        title,
        image,
      });
      await gallery.save();
      stylist.galleries.push(gallery._id);
      await stylist.save();
      return res.status(201).json(gallery);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve all galleries for a stylist
  async retrieveAll(req, res) {
    console.log("GalleryController > retrieveAll");
    const stylistId = req.params.id;
    if (!stylistId) {
      return res.status(401).json({ message: "stylistId field missing" });
    }
    try {
      const stylist = await Stylist.findById(stylistId).populate("galleries");
      const galleries = stylist.galleries;
      if (!galleries) {
        return res.status(404).json({ message: "Galleries not found" });
      }
      return res.status(200).json(galleries);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve a gallery by id
  async retrieve(req, res) {
    console.log("GalleryController > retrieve");
    const { id } = req.params;
    try {
      const gallery = await Gallery.findById(id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      return res.status(200).json(gallery);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Delete a gallery by id
  async delete(req, res) {
    console.log("GalleryController > delete");
    const { id } = req.params;
    const stylistId = req.userId;
    if (!stylistId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const stylist = await Stylist.findById(stylistId).populate("galleries");
      const has = stylist.galleries
        .filter((gallery) => {
          return gallery._id == id;
        })
        .reduce(true, (acc, val) => {
          return acc && val;
        });
      if (!has) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const gallery = await Gallery.findByIdAndDelete(id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      return res.status(200).json({ message: "Gallery deleted successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },
};
module.exports = GalleryController;
