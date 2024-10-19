const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const sequelize = require("./config/database");
const app = express();
const studentAuthRoutes = require("./routes/StudentAuthRoute");
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const multer = require('multer');


// Setup multer for handling multipart/form-data
const upload = multer();

app.use(upload.none()); // This will parse incoming form data but not files


// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Content-Type", "X-Api-Key", "proxy"],
  })
);
// Routes
app.use("/user", studentAuthRoutes);

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
