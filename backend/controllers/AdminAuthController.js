// const User = require("../models/UserModel");
// const Admin = require("../models/AdminModel");
// const sequelize = require("../config/database");
// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET;
// const { OAuth2Client } = require("google-auth-library");
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const { Op } = require("sequelize");
// const UnavailableDate = require("../models/UnavailableDateModel");
// const EndSemesterDate = require("../models/EndSemesterDate");
// const AuditLog = require("../models/AuditLogModel");
// const bcrypt = require("bcryptjs");
// const { rollbackUpload } = require("../config/multer");

// async function verify(token) {
//   const ticket = await client.verifyIdToken({
//     idToken: token,
//     audience: process.env.GOOGLE_CLIENT_ID,
//   });

//   return ticket.getPayload();
// }

// // Register Admin
// exports.registerAdmin = async (req, res) => {
//   const t = await sequelize.transaction();
//   let publicIds = [];

//   try {
//     const { first_name, middle_name, last_name, email, password } = req.body;

//     const profile_pic = req.file;

//     if (!first_name || !last_name || !email || !password || !profile_pic) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const profilePicPath = profile_pic.path || profile_pic.filename;
//     publicIds.push(profilePicPath);

//     const newUser = await User.create(
//       {
//         first_name,
//         middle_name,
//         last_name,
//         role: "admin",
//         email,
//         password: hashedPassword,
//       },
//       { transaction: t }
//     );

//     const newAdmin = await Admin.create(
//       {
//         profile_pic: profilePicPath,
//         user_id: newUser.user_id,
//       },
//       { transaction: t }
//     );

//     // Commit the transaction
//     await t.commit();
//     res.status(201).json({
//       message: "Admin registered successfully",
//       admin: newAdmin,
//     });
//   } catch (error) {
//     await t.rollback();

//     await rollbackUpload(publicIds);
//     // console.error("Registration error:", error);
//     res.status(500).json({
//       message: "Failed registration. Please check your information",
//       error: error.message,
//     });
//   }
// };

// // Login an admin
// exports.loginAdmin = async (req, res) => {
//   const { email, password } = req.body;

//   // Check for missing fields
//   if (!email) return res.status(400).json({ message: "Email is required" });
//   if (!password)
//     return res.status(400).json({ message: "Password is required" });

//   try {
//     // Find user by email
//     const user = await User.findOne({
//       where: {
//         email,
//         role: {
//           [Op.or]: ["admin", "superadmin"], // nilagyan ko lang superadmin
//         },
//       },
//     });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Compare the provided password with the hashed password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { adminId: user.user_id, role: user.role }, // Change from userId to adminId
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       role: user.role,
//       userId: user.user_id,
//       first_name: user.first_name,
//       last_name: user.last_name,
//     });
//   } catch (error) {
//     // console.error("Login error:", error);
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// };

// // Change Password for Admin
// exports.adminChangePassword = async (req, res) => {
//   const adminId = req.user.userId; // Assume userId is available in req.user from the auth middleware
//   const { currentPassword, newPassword } = req.body;

//   try {
//     // Find the admin user
//     const admin = await User.findOne({
//       where: { user_id: adminId, role: { [Op.or]: ["admin", "superadmin"] } },
//     });
//     if (!admin) {
//       return res.status(404).json({ message: "Admin user not found" });
//     }

//     // Check if the current password is correct
//     const isMatch = await bcrypt.compare(currentPassword, admin.password);
//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ message: "Current password is incorrect." });
//     }

//     // Hash the new password and save it
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     admin.password = hashedNewPassword;
//     await admin.save();

//     res.status(200).json({ message: "Password updated successfully." });
//   } catch (error) {
//     // console.error("Error changing password:", error);
//     res
//       .status(500)
//       .json({ message: "Error changing password", error: error.message });
//   }
// };

// // Get all admin and superadmin accounts
// exports.getAllAdminAccounts = async (req, res) => {
//   try {
//     // Fetch all users with the role of admin or superadmin
//     const users = await User.findAll({
//       where: {
//         role: {
//           [Op.or]: ["admin", "superadmin"],
//         },
//       },
//       attributes: [
//         "user_id",
//         "first_name",
//         "last_name",
//         "email",
//         "role",
//         "createdAt",
//       ],
//     });

//     res.status(200).json(users);
//   } catch (error) {
//     // console.error("Error fetching admin accounts:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching admin accounts", error: error.message });
//   }
// };

// exports.getAllUnavailableDates = async (req, res) => {
//   try {
//     const endSemesterDates = await EndSemesterDate.findAll();
//     const unavailableDates = await UnavailableDate.findAll();

//     res.status(200).json({
//       endSemesterDates,
//       unavailableDates,
//     });
//   } catch (error) {
//     // console.error("Error fetching dates:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
// // GET request to display an unavailable date
// exports.getUnavailableDates = async (req, res) => {
//   try {
//     const dates = await UnavailableDate.findAll(); // This should work if the model is set up correctly
//     res.status(200).json(dates);
//   } catch (error) {
//     // console.error("Error fetching dates:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // ADD request to add an unavailable date
// exports.addUnavailableDate = async (req, res) => {
//   const { date, description } = req.body;

//   if (!date || !description) {
//     return res
//       .status(400)
//       .json({ message: "Date and description are required" });
//   }

//   try {
//     // Check if the date already exists
//     const existingDate = await UnavailableDate.findOne({
//       where: { date: new Date(date) },
//     });
//     if (existingDate) {
//       return res.status(409).json({ message: "This date already exists." });
//     }

//     // Add the new date
//     const newDate = await UnavailableDate.create({ date, description });
//     res.status(201).json(newDate);
//   } catch (error) {
//     // console.error("Error creating unavailable date:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // DELETE request to remove an unavailable date
// exports.deleteUnavailableDate = async (req, res) => {
//   const { date } = req.params; // Get the date from URL parameter

//   try {
//     // Convert the string date to a Date object (assuming your database uses a date type)
//     const deletedDate = await UnavailableDate.destroy({
//       where: { date: new Date(date) }, // Make sure this matches your DB schema
//     });

//     if (deletedDate) {
//       return res.status(200).json({ message: "Date removed successfully" });
//     } else {
//       return res.status(404).json({ message: "Date not found" });
//     }
//   } catch (error) {
//     // console.error("Error removing date:", error);
//     return res.status(500).json({ message: "Failed to remove date" });
//   }
// };

// // Get all end-semester dates
// exports.getEndSemesterDates = async (req, res) => {
//   try {
//     const dates = await EndSemesterDate.findAll(); // Use the correct model here
//     res.status(200).json(dates);
//   } catch (error) {
//     // console.error("Error fetching end-semester dates:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // Add a new end-semester date
// exports.addEndSemesterDate = async (req, res) => {
//   const { date, description } = req.body;

//   if (!date || !description) {
//     return res
//       .status(400)
//       .json({ message: "Date and description are required" });
//   }

//   try {
//     // Check if the date already exists
//     const existingDate = await EndSemesterDate.findOne({
//       where: { date: new Date(date) },
//     });
//     if (existingDate) {
//       return res.status(409).json({ message: "This date already exists." });
//     }

//     // Add the new date
//     const newDate = await EndSemesterDate.create({ date, description });
//     res.status(201).json(newDate);
//   } catch (error) {
//     // console.error("Error creating end-semester date:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// // Delete an end-semester date
// exports.deleteEndSemesterDate = async (req, res) => {
//   const { date } = req.params;

//   try {
//     const deletedDate = await EndSemesterDate.destroy({
//       where: { date: new Date(date) },
//     });

//     if (deletedDate) {
//       return res.status(200).json({ message: "Date removed successfully" });
//     } else {
//       return res.status(404).json({ message: "Date not found" });
//     }
//   } catch (error) {
//     // console.error("Error removing end-semester date:", error);
//     return res.status(500).json({ message: "Failed to remove date" });
//   }
// };

// exports.getAuditLogs = async (req, res) => {
//   try {
//     const logs = await AuditLog.findAll({
//       order: [["timestamp", "DESC"]], // Sort by newest logs first
//       limit: 50, // Limit results to prevent overload
//     });

//     res.json(logs);
//   } catch (error) {
//     // console.error("Error fetching audit logs:", error);
//     res.status(500).json({ message: "Error fetching logs" });
//   }
// };
