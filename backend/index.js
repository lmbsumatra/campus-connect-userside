const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const sequelize = require("./config/database");
const studentAuthRoutes = require("./routes/StudentAuthRoute");
const listingRoutes = require("./routes/ListingRoute");
const postRoutes = require("./routes/PostRoute");
const dotenv = require("dotenv");
const cloudinary = require("./config/cloudinary");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Routes
app.use("/user", studentAuthRoutes);

app.use("/listings", listingRoutes);

app.use("/posts", postRoutes);

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 3001; // Use env variable for port
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

