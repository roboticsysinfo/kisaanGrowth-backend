const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { setupSocket } = require('./socket/socketHandler'); // ✅ new

const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const farmRoutes = require('./routes/farmRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const shopRoutes = require('./routes/shopRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const stateCityRoutes = require('./routes/stateCityRoutes');
const customerRoutes = require('./routes/customerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const requestOrderRoutes = require("./routes/requestOrderRoutes");
const siteDetailsRoutes = require("./routes/siteDetailsRoutes");
const bannerRoutes = require('./routes/bannerRoutes');
const blogCategoryRoutes = require('./routes/blogCategoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const deliveryPreferenceRoutes = require('./routes/deliveryPreferenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const helpSupportRoutes = require('./routes/helpSupportRoutes');
const adminMessageRoutes = require('./routes/adminMessageRoutes')
const redeemProductRoutes = require('./routes/redeemProductsRoutes')
const farmingTipsRoutes = require('./routes/farmingTipsRoutes')
const familyFarmerRoutes = require('./routes/familyFarmerRoutes')
const customerRedeemProductRoutes = require('./routes/customerRedeemProductRoutes')
const CustomerHelpSupportRoutes = require('./routes/CustomerHelpSupportRoutes')
const sitemapRoutes = require("./routes/sitemapRoutes");
const fcmRoutes = require('./routes/fcmRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } }); // ✅ socket setup




const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, auth headers)
};

app.use(cors(corsOptions));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL parameters parsing
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// ========= Routes=============
app.use('/api', sitemapRoutes)
app.use('/api', stateCityRoutes)
app.use('/api', adminRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', farmRoutes);
app.use('/api', reviewRoutes);
app.use('/api', shopRoutes);
app.use('/api', farmerRoutes);
app.use('/api', customerRoutes);
app.use('/api', cartRoutes);
app.use('/api', requestOrderRoutes);
app.use('/api', siteDetailsRoutes);
app.use('/api', bannerRoutes);
app.use('/api', blogCategoryRoutes);
app.use('/api', blogRoutes);
app.use('/api', deliveryPreferenceRoutes);
app.use('/api', notificationRoutes);
app.use('/api', helpSupportRoutes);
app.use('/api', adminMessageRoutes)
app.use('/api', redeemProductRoutes)
app.use('/api', farmingTipsRoutes);
app.use('/api', familyFarmerRoutes)
app.use('/api', customerRedeemProductRoutes);
app.use('/api', CustomerHelpSupportRoutes)
app.use('/api', fcmRoutes);

// ========= Routes end=============

app.get('/', (req, res) => {
    res.send('Hello Kissan Growth')
})

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});


setupSocket(io); // ✅ Initialize socket handling

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running successfully on ${port}`);
});