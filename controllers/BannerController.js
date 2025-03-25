const SiteDetails = require("../models/SiteDetails");

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
    console.log("🔥 Received Body Data:", req.body);
    console.log("📸 Received File:", req.file); // Check if file is received

    const { title, category } = req.body;
    const banner_image = req.file ? req.file.filename : null; // Save only filename

    if (!title || !banner_image || !category) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let siteDetails = await SiteDetails.findOne();
        if (!siteDetails) {
            siteDetails = new SiteDetails({ banners: [] });
        }

        siteDetails.banners.push({ title, banner_image, category });
        await siteDetails.save();

        res.status(201).json({ message: "Banner added successfully", banners: siteDetails.banners });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update a banner
exports.updateBanner = async (req, res) => {
    const { bannerId } = req.params;
    const { title, banner_image, category } = req.body;

    try {
        const siteDetails = await SiteDetails.findOne();
        if (!siteDetails) return res.status(404).json({ message: "Site details not found" });

        const banner = siteDetails.banners.id(bannerId);
        if (!banner) return res.status(404).json({ message: "Banner not found" });

        if (title) banner.title = title;
        if (banner_image) banner.banner_image = banner_image;
        if (category) banner.category = category;

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
