const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const sequelize = require("./config/database");
const dotenv = require("dotenv");
const cloudinary = require("./config/cloudinary");

// routes
const studentAuthRoutes = require("./routes/StudentAuthRoute");
const listingRoutes = require("./routes/ListingRoute");
const postRoutes = require("./routes/PostRoute");
const reviewAndRateRoutes = require("./routes/ReviewAndRateRoutes.js");
const adminAuthRoutes = require("./routes/AdminAuthRoutes");
const itemForSaleRoutes = require("./routes/ItemForSaleRoute");
const rentalTransactionRoutes = require("./routes/RentalTransactionRoute");
const cartRoutes = require("./routes/CartRoutes.js");
const http = require("http");
const { initializeSocket } = require("./socket");
const nodemailer = require("nodemailer");
const reportRoutes = require("./routes/ReportRoute");
const adminTransactionRoutes = require("./routes/AdminTransactionRoute.js");
const notificationRoutes = require("./routes/NotificationRoute");
const recentActivities = require("./routes/RecentActivitiesRoutes.js");

// cron
const autoDeclineExpired = require("./cron-job/rental-transaction/AutoDecline.js");
const cron = require("node-cron");
//const endSemesterCron = require("./cron-job/endSemester.js"); for resetting status of verified student

// cron.schedule("1 * * * * * *", async () => {
//   console.log("Running cron job to auto-decline expired rentals...");
//   await autoDeclineExpired(); // Call the function to decline expired rentals
// });
const conversationRoutes = require("./routes/ConversationRoute");
const messageRoutes = require("./routes/MessageRoute");

// Load environment variables
dotenv.config();

// Initialize Express app and create HTTP server
const app = express();
const server = http.createServer(app);
const { io, notifyAdmins } = initializeSocket(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: "*", // Allowing only the frontend app at localhost:3000
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow credentials (cookies, headers) to be sent
};
app.use(cors(corsOptions));

// Set custom headers for security
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Make socket.io and notifyAdmins available to routes
app.use((req, res, next) => {
  req.io = io;
  req.notifyAdmins = notifyAdmins;
  next();
});

// Routes
app.use("/user", studentAuthRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/listings", listingRoutes); // Listings route that will trigger notifications
app.use("/posts", postRoutes);
app.use("/item-for-sale", itemForSaleRoutes);
app.use("/review-and-rate", reviewAndRateRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/transactions", adminTransactionRoutes);
app.use("/api/recent-activities", recentActivities);

// Other routes
app.use("/user", studentAuthRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/listings", listingRoutes);
app.use("/posts", postRoutes);
app.use("/item-for-sale", itemForSaleRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/transactions", adminTransactionRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware for unexpected errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Routes
app.use("/user", studentAuthRoutes);
app.use("/admin", adminAuthRoutes);

app.use("/listings", listingRoutes);

app.use("/posts", postRoutes);
app.use("/item-for-sale", itemForSaleRoutes);
app.use("/rental-transaction", rentalTransactionRoutes(io));

// messsaging
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
