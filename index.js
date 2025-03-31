const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const path = require('path');
const adminRoutes = require('./routes/adminRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const productRoutes = require('./routes/productRoutes')
const farmRoutes = require('./routes/farmRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const shopRoutes = require('./routes/shopRoutes')
const farmerRoutes = require('./routes/farmerRoutes')
const stateCityRoutes = require('./routes/stateCityRoutes')
const customerRoutes = require('./routes/customerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const requestOrderRoutes = require("./routes/requestOrderRoutes");
const siteDetailsRoutes = require("./routes/siteDetailsRoutes");
const bannerRoutes = require('./routes/bannerRoutes')
const blogCategoryRoutes = require('./routes/blogCategoryRoutes');
const blogRoutes = require('./routes/blogRoutes')


const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: (origin, callback) => {
      const allowedOrigins = [
        "https://kissangrowth.netlify.app",
        "http://localhost:3000"
      ];

      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(null, true); // Allow all origins (temporary fix for mobile apps)
      }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL parameters parsing
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello Kissan Growth')
})

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

// ========= Routes=============
app.use('/api', stateCityRoutes)
app.use('/api', adminRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', farmRoutes);
app.use('/api', reviewRoutes)
app.use('/api', shopRoutes)
app.use('/api', farmerRoutes)
app.use('/api', customerRoutes)
app.use('/api', cartRoutes);
app.use('/api', requestOrderRoutes)
app.use('/api', siteDetailsRoutes)
app.use('/api', bannerRoutes)
app.use('/api', blogCategoryRoutes)
app.use('/api', blogRoutes)




// ========= Routes end=============

app.listen(port, () => {
  console.log(`Server is running successfully on ${port}`);
});