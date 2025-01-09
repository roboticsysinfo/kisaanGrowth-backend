const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes')

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: (origin, callback) => {
      const allowedOrigins = [
          "", // Your production frontend URL
          "http://localhost:3000",              // Your local development frontend
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

connectDB();

app.get('/', (req, res) => {
    res.send('Hello Kissan Growth')
})

// ========= Routes=============
app.use('/api', userRoutes);
// ========= Routes end=============

app.listen(port, () => {
  console.log(`Server is running successfully on ${port}`);
});