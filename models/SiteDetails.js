const mongoose = require("mongoose");

const siteDetailsSchema = new mongoose.Schema({
    contactDetails: {
        phone: { type: String, default: null }, 
        email: { type: String, default: null },
        address: { type: String, default: null }
    },
    siteLogo: { type: String, default: null }, 
    socialMedia: [
        {
            platform: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],
    about: {
        title: { type: String, default: null }, 
        content: { type: String, default: null },
        footer_text: { type: String, default: null}
    },
    banners: [
        {
            title: { type: String, required: true },
            banner_image: { type: String, required: true },
            category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
        }
    ]
}, { timestamps: true });


module.exports = mongoose.model("SiteDetails", siteDetailsSchema);
