const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const sequelize = require("./config/database");
const dotenv = require("dotenv");
const http = require("http");
const { initializeSocket } = require("./socket");
const nodemailer = require("nodemailer");

// Route Imports
const studentAuthRoutes = require("./routes/StudentAuthRoute");
const adminAuthRoutes = require("./routes/AdminAuthRoutes");
const listingRoutes = require("./routes/ListingRoute");
const postRoutes = require("./routes/PostRoute");
const reviewAndRateRoutes = require("./routes/ReviewAndRateRoutes.js");
const itemForSaleRoutes = require("./routes/ItemForSaleRoute");
const rentalTransactionRoutes = require("./routes/RentalTransactionRoute");
const cartRoutes = require("./routes/CartRoutes.js");
const recentActivitiesRoutes = require("./routes/RecentActivitiesRoutes.js");
const conversationRoutes = require("./routes/ConversationRoute");
const messageRoutes = require("./routes/MessageRoute");
const notificationRoutes = require("./routes/NotificationRoute");
const followRoutes = require("./routes/FollowRoutes");
const reportRoutes = require("./routes/ReportRoute");
const adminTransactionRoutes = require("./routes/AdminTransactionRoute.js");
const uploadRoutes = require("./routes/UploadRoute.js");
const systemConfigRoutes = require("./routes/SystemConfigRoutes.js");
const orgsRoutes = require("./routes/OrgsRoute.js");
const buySlotRoutes = require("./routes/BuySlotRoute.js")

// Cron Jobs
const autoDeclineExpired = require("./cron-job/rental-transaction/AutoDecline.js");
const cron = require("node-cron");
const endSemesterCron = require("./cron-job/endSemester.js"); //for resetting status of verified student
const {
  AllowToProceed,
} = require("./cron-job/rental-transaction/AllowToProceed.js");
const {
  scheduleExpireRestrictions,
} = require("./cron-job/ExpireRestrictions.js");

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with emitters
const { io, emitNotification, notifyAdmins } = initializeSocket(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: 'https://rentupeers.shop',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Security Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Inject Socket.io and emitters into request
app.use((req, res, next) => {
  req.io = io;
  req.notifyAdmins = notifyAdmins;
  req.emitNotification = emitNotification;
  next();
});

// Inject emitNotification into Rental Transaction Controller
const rentalTransactionController =
  require("./controllers/rental-transactions/RentalTransactionController.js")({
    emitNotification,
  });

const transactionReportController =
  require("./controllers/TransactionReportController")({
    emitNotification,
  });

const transactionReportsRoutes = require("./routes/TransactionReportsRoute")({
  emitNotification,
});

// Define Routes
app.use("/user", studentAuthRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/listings", listingRoutes);
app.use("/posts", postRoutes);
app.use("/item-for-sale", itemForSaleRoutes);
app.use("/review-and-rate", reviewAndRateRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/transactions", adminTransactionRoutes);
app.use("/api/recent-activities", recentActivitiesRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/orgs", orgsRoutes);
app.use("/api/buy-slot", buySlotRoutes);

app.use("/api/posts", uploadRoutes);

// Ensure rentalTransactionRoutes is correctly wrapped with its controller
app.use(
  "/rental-transaction",
  rentalTransactionRoutes(rentalTransactionController)
);

app.use("/api/system-config", systemConfigRoutes);

// Mount the transaction reports route
app.use("/api/transaction-reports", transactionReportsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  // console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
try {
  scheduleExpireRestrictions(); // Start the restriction expiry check
  AllowToProceed();
} catch (cronError) {
  console.error(cronError);
}

app.use("/try", (req, res) => {
  res.send({ message: "hi" });
});

AllowToProceed();
module.exports = { app, server, io };
