const { create } = require('xmlbuilder2');
const Farmer = require('../models/Farmer');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Blog = require('../models/Blog');
const slugify = require("../utils/slugify");
require('dotenv').config();

const baseUrl = process.env.REACT_APP_URI;

const generateXml = (urls) => {
  const root = create({ version: '1.0' }).ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

  urls.forEach(url => {
    root.ele('url')
      .ele('loc').txt(url).up()
      .ele('changefreq').txt('weekly').up()
      .ele('priority').txt('0.8');
  });

  return root.end({ prettyPrint: true });
};

exports.farmerSitemap = async (req, res) => {
  const farmers = await Farmer.find({ isKYCVerified: true });
  const urls = farmers.map(f => {
    const slug = `${slugify(f.name)}-${f._id}`;
    return `${baseUrl}/farmer/${slug}`;
  });

  res.header('Content-Type', 'application/xml').send(generateXml(urls));
};

exports.shopSitemap = async (req, res) => {
  const shops = await Shop.find();
  const urls = shops.map(s => {
    const slug = `${slugify(s.name)}-${s._id}`;
    return `${baseUrl}/shop/${slug}`;
  });

  res.header('Content-Type', 'application/xml').send(generateXml(urls));
};

exports.productSitemap = async (req, res) => {
  const products = await Product.find();
  const urls = products.map(p => {
    const slug = `${slugify(p.name)}-${p._id}`;
    return `${baseUrl}/product/${slug}`;
  });

  res.header('Content-Type', 'application/xml').send(generateXml(urls));
};

exports.blogSitemap = async (req, res) => {
  const blogs = await Blog.find();
  const urls = blogs.map(b => {
    const slug = `${slugify(b.title)}-${b._id}`;
    return `${baseUrl}/blog/${slug}`;
  });

  res.header('Content-Type', 'application/xml').send(generateXml(urls));
};

exports.staticSitemap = (req, res) => {
  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/about-us`,
    `${baseUrl}/contact`,
    `${baseUrl}/kissan-growth-mobile-apps`,
    `${baseUrl}/farmers`,
    `${baseUrl}/products`,
    `${baseUrl}/shops`,
    `${baseUrl}/farmer/register`,
    `${baseUrl}/farmer/login`,
    `${baseUrl}/register`,
    `${baseUrl}/login`,
    `${baseUrl}/blogs`,
    `${baseUrl}/terms-and-conditions`,
    `${baseUrl}/privacy-policy`,
  ];

  res.header('Content-Type', 'application/xml').send(generateXml(urls));
};

exports.mainSitemap = (req, res) => {
  const root = create({ version: '1.0' }).ele('sitemapindex', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

  const sections = ['farmers', 'shops', 'products', 'blogs', 'pages'];

  sections.forEach(section => {
    root.ele('sitemap')
      .ele('loc').txt(`${baseUrl}/sitemap/${section}`);
  });

  res.header('Content-Type', 'application/xml').send(root.end({ prettyPrint: true }));
};
