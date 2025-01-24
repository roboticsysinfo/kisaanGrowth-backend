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
const subCategoryRoutes = require('./routes/subCategoryRoutes')
const farmerRoutes = require('./routes/farmerRoutes')



const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: (origin, callback) => {
      const allowedOrigins = [
        `${process.env.REACT_APP_URI}`
      ];

      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error("Not allowed by CORS"));
      }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true,                         // Allow credentials (cookies, auth headers)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello Kissan Growth')
})

// ========= Routes=============

app.use('/api', adminRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', farmRoutes);
app.use('/api', reviewRoutes)
app.use('/api', shopRoutes)
app.use('/api', subCategoryRoutes)
app.use('/api', farmerRoutes)



// ========= Routes end=============

app.listen(port, () => {
  console.log(`Server is running successfully on ${port}`);
});