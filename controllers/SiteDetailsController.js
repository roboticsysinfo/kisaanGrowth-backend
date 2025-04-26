const SiteDetails = require("../models/SiteDetails");
const Product = require("../models/Product");
const Shop = require("../models/Shop");



// ======= Update Contact Details =======

const getSiteDetails = async (req, res) => {
    try {
        const siteDetails = await SiteDetails.findOne();
        res.json({ success: true, siteDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Create or Update
const updateSiteDetails = async (req, res) => {
    try {
        const data = req.body;
        let siteDetails = await SiteDetails.findOne(); // Fetch existing details

        if (siteDetails) {
            // Update existing record
            siteDetails = await SiteDetails.findOneAndUpdate({}, data, { new: true });
        } else {
            // Create new record
            siteDetails = new SiteDetails(data);
            await siteDetails.save();
        }

        res.json({ success: true, siteDetails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const updateContactDetail = async (req, res) => {
    try {
        let siteDetails = await SiteDetails.findOne();
        if (!siteDetails) return res.status(404).json({ message: "Site details not found" });

        // ✅ Update only the provided fields
        if (req.body.phone !== undefined) siteDetails.contactDetails.phone = req.body.phone;
        if (req.body.email !== undefined) siteDetails.contactDetails.email = req.body.email;
        if (req.body.address !== undefined) siteDetails.contactDetails.address = req.body.address;

        await siteDetails.save();
        res.json({ success: true, message: "Contact details updated!", contactDetails: siteDetails.contactDetails });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ======= Add About Content =======
const AddSiteLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a valid image file." });
        }

        let siteDetails = await SiteDetails.findOne();

        if (!siteDetails) {
            // Create new record if it doesn't exist
            siteDetails = new SiteDetails({ siteLogo: req.file.path }); // ✅ Save file path
        } else {
            // Update existing record
            siteDetails.siteLogo = req.file.path; // ✅ Save file path
        }

        await siteDetails.save();
        res.json({ success: true, message: "Site logo updated successfully!", siteLogo: siteDetails.siteLogo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// // ======= Update Site Logo =======
// const siteLogoupdate = async (req, res) => {
//     try {
//         let siteDetails = await SiteDetails.findOne();
//         if (!siteDetails) return res.status(404).json({ message: "Site details not found" });

//         siteDetails.siteLogo = req.body.siteLogo;
//         await siteDetails.save();
//         res.json({ success: true, message: "Site logo updated!" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// ======= Add About Content =======
const AddSiteAbout = async (req, res) => {
    try {
        let siteDetails = await SiteDetails.findOne();

        if (!siteDetails) {
            // Agar record nahi hai toh naya create karo
            siteDetails = new SiteDetails({ about: req.body });
        } else {
            // Agar record hai toh update karo
            siteDetails.about = req.body;
        }

        await siteDetails.save();
        res.json({ success: true, message: "About section updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateSiteAbout = async (req, res) => {
    try {

        let siteDetails = await SiteDetails.findOne();

        if (!siteDetails) return res.status(404).json({ message: "Site details not found" });

        const { title, content , footer_text} = req.body; // Destructure request body

        if (!title || !content || !footer_text) {
            return res.status(400).json({ message: "Title or content and Footer Text are required" });
        }

        siteDetails.about.title = title;
        siteDetails.about.content = content;
        siteDetails.about.footer_text = footer_text;


        await siteDetails.save();

        res.json({ success: true, message: "About section updated successfully!", about: siteDetails.about });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// ======= Update Social Media Accounts =======
const updateSocialMedia =  async (req, res) => {

    try {
        let siteDetails = await SiteDetails.findOne();
        if (!siteDetails) return res.status(404).json({ message: "Site details not found" });

        siteDetails.socialMedia = req.body.socialMedia; // Pass Array
        await siteDetails.save();
        res.json({ success: true, message: "Social media links updated!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}


const SearchProductsAndShops = async (req, res) => {

    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {

        const products = await Product.find({ name: { $regex: query, $options: "i" } });
        const shops = await Shop.find({ shop_name: { $regex: query, $options: "i" } });

        res.json({ products, shops });

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }

}


const updateTermsAndConditions = async (req, res) => {
    try {
        const { termsAndConditions } = req.body;

        if (!termsAndConditions) {
            return res.status(400).json({ message: "Terms and Conditions content is required" });
        }

        let siteDetails = await SiteDetails.findOne();
        if (!siteDetails) {
            siteDetails = new SiteDetails({ termsAndConditions });
        } else {
            siteDetails.termsAndConditions = termsAndConditions;
        }

        await siteDetails.save();
        res.json({ success: true, message: "Terms and Conditions updated successfully!", termsAndConditions: siteDetails.termsAndConditions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updatePrivacyPolicy = async (req, res) => {
    try {
        const { privacyPolicy } = req.body;

        if (!privacyPolicy) {
            return res.status(400).json({ message: "Privacy Policy content is required" });
        }

        let siteDetails = await SiteDetails.findOne();
        if (!siteDetails) {
            siteDetails = new SiteDetails({ privacyPolicy });
        } else {
            siteDetails.privacyPolicy = privacyPolicy;
        }

        await siteDetails.save();
        res.json({ success: true, message: "Privacy Policy updated successfully!", privacyPolicy: siteDetails.privacyPolicy });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getTermsAndConditions = async (req, res) => {
    try {
        const siteDetails = await SiteDetails.findOne();

        if (!siteDetails || !siteDetails.termsAndConditions) {
            return res.status(404).json({ success: false, message: "Terms and Conditions not found" });
        }

        res.json({ success: true, termsAndConditions: siteDetails.termsAndConditions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getPrivacyPolicy = async (req, res) => {
    try {
        const siteDetails = await SiteDetails.findOne();

        if (!siteDetails || !siteDetails.privacyPolicy) {
            return res.status(404).json({ success: false, message: "Privacy Policy not found" });
        }

        res.json({ success: true, privacyPolicy: siteDetails.privacyPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports={
    updateSocialMedia,
    AddSiteAbout,
    updateContactDetail,
    getSiteDetails,
    updateSiteDetails,
    updateSiteAbout,
    AddSiteLogo,
    SearchProductsAndShops,
    updateTermsAndConditions,  
    updatePrivacyPolicy,
    getTermsAndConditions,
    getPrivacyPolicy
}