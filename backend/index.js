const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const sequelize = require("./config/database");
const studentAuthRoutes = require("./routes/StudentAuthRoute");
const listingRoutes = require("./routes/ListingRoute");
const postRoutes = require("./routes/PostRoute");
const dotenv = require("dotenv");
const cloudinary = require("./config/cloudinary");
const adminAuthRoutes = require("./routes/AdminAuthRoutes");
const itemForSaleRoutes = require("./routes/ItemForSaleRoute");
const rentalTransactionRoutes = require("./routes/RentalTransactionRoute");
const http = require("http");
const { initializeSocket } = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const { io, notifyAdmins } = initializeSocket(server); // Initialize Socket.IO

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Allowing only the frontend app at localhost:3000
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

// Make notifyAdmins available to all routes via middleware
app.use((req, res, next) => {
  req.notifyAdmins = notifyAdmins;
  next();
});

// Routes
app.use("/user", studentAuthRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/listings", listingRoutes); // Listings route that will trigger notifications
app.use("/posts", postRoutes);
app.use("/item-for-sale", itemForSaleRoutes);
app.use("/rental-transaction", rentalTransactionRoutes);

// Error handling middleware for unexpected errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

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
