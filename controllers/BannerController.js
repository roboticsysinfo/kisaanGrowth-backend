const SiteDetails = require("../models/SiteDetails");
const imagekit = require("../utils/imagekit");
const fs = require("fs");


// Get all banners
exports.getBanners = async (req, res) => {
    try {
        const siteDetails = await SiteDetails.findOne();
        if (!siteDetails) return res.status(404).json({ message: "Site details not found" });
        res.json(siteDetails.banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Add a new banner
exports.addBanner = async (req, res) => {
    const { title, category } = req.body;
    const file = req.file;
  
    if (!title || !file || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Upload to ImageKit
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: "/uploads"
      });
  
      const banner_image = uploadResponse.url; // Get the full image URL
  
      let siteDetails = await SiteDetails.findOne();
      if (!siteDetails) {
        siteDetails = new SiteDetails({ banners: [] });
      }
  
      siteDetails.banners.push({ title, banner_image, category });
      await siteDetails.save();
  
      res.status(201).json({
        message: "Banner added successfully",
        banners: siteDetails.banners
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


// Update a banner

exports.updateBanner = async (req, res) => {
    const { bannerId } = req.params;
    const { title, category } = req.body;
    const file = req.file;
  
    console.log("bannerId", bannerId)
    console.log("title", title)
    console.log("category", category)
    console.log("file", file)


    try {
      const siteDetails = await SiteDetails.findOne();

      console.log("siteDetails", siteDetails)

      if (!siteDetails) return res.status(404).json({ message: "Site details not found" });
  
      const banner = siteDetails.banners.id(bannerId);

      console.log("banner", banner)

      if (!banner) return res.status(404).json({ message: "Banner not found" });
  
      if (title) banner.title = title;
      if (category) banner.category = category;
  
      if (file) {
        // Upload new banner image
        const uploadResponse = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: "/uploads"
        });
  
        console.log("uploadResponse", uploadResponse)

        banner.banner_image = uploadResponse.url;

        console.log("banner.banner_image", banner.banner_image)

      }
  
      await siteDetails.save();
      res.json({ message: "Banner updated successfully", banner });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  



// Delete a banner
exports.deleteBanner = async (req, res) => {
    const { bannerId } = req.params;

    try {
        const siteDetails = await SiteDetails.findOne();
        if (!siteDetails) return res.status(404).json({ message: "Site details not found" });

        siteDetails.banners = siteDetails.banners.filter(banner => banner._id.toString() !== bannerId);
        await siteDetails.save();

        res.json({ message: "Banner deleted successfully", banners: siteDetails.banners });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
