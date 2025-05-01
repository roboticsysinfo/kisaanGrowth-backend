// utils/slugify.js
const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")       // space -> dash
      .replace(/[^\w\-]+/g, "")   // remove non-word chars
      .replace(/\-\-+/g, "-")     // collapse multiple dashes
      .replace(/^-+/, "")         // trim start dash
      .replace(/-+$/, "");        // trim end dash
  
  module.exports = slugify;
  