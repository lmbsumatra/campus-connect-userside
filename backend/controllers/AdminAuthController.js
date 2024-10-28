const User = require("../models/UserModel");
const Admin = require("../models/AdminModel");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cloudinary = require("cloudinary").v2;

const bcrypt = require("bcrypt");
const { rollbackUpload } = require("../config/multer");

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token, 
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}


// Register Admin
exports.registerAdmin = async (req, res) => {
  console.log("File:", req.file);
  console.log("Body:", req.body);
  const t = await sequelize.transaction();
  let publicIds = []; 

  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      password,
    } = req.body;

    const profile_pic = req.file;

    if (!first_name || !last_name || !email || !password || !profile_pic) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePicPath = profile_pic.path || profile_pic.filename; 
    publicIds.push(profilePicPath); 

    const newUser = await User.create(
      { first_name, middle_name, last_name, role: "student", email, password: hashedPassword },
      { transaction: t }
    );

    const newAdmin = await Admin.create(
      {
        profile_pic: profilePicPath,
        user_id: newUser.user_id,
      },
      { transaction: t }
    );

    // Commit the transaction
    await t.commit();
    res.status(201).json({
      message: "Admin registered successfully",
      admin: newAdmin,
    });
  } catch (error) {
    await t.rollback(); 

    await rollbackUpload(publicIds); 
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Failed registration. Please check your information",
      error: error.message,
    });
  }
};


// // Login an admin
// exports.loginAdmin = async (req, res) => {
//   const { email, password } = req.body;

//   // Check for missing fields
//   if (!email) return res.status(400).json({ message: "Email is required" });
//   if (!password) return res.status(400).json({ message: "Password is required" });

//   try {
//     // Find user by email
//     const user = await User.findOne({ where: { email, role: "admin" } });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Compare the provided password with the hashed password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user.user_id, role: user.role },
//       JWT_SECRET
//     );

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// };
