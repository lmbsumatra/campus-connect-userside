// const Conversation = require('../models/ConversationModel');
// const User = require('../models/UserModel');
// const sequelize = require('../config/database');
// const { models } = require("../models/index");

// exports.getAllStudents = async (req, res) => {
//     try {
//       const users = await models.User.findAll({
//         attributes: ["user_id", "first_name", "last_name", "createdAt"],
//         include: [
//           {
//             model: models.Student,
//             as: "student",
//             attributes: ["college"],
//           },
//         ],
//       });
  
//       res.status(200).json(users);
//       // console.log(JSON.stringify(listings, null, 2)); // Log for debugging
//     } catch (error) {
//       console.error("Error fetching posts:", error);
//       res.status(500).json({ error: error.message });
//     }
//   };

// exports.getUserInformation = async (req, res) => {
//     const userId = req.user.userId;
  
//     try {
//       const student = await Conversation.findOne({ where: { user_id: userId } });
//       if (!student) {
//         return res.status(404).json({ message: "Student record not found" });
//       }
  
//       const user = await User.findByPk(student.user_id);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       res.status(200).json({
//         message: "User information retrieved successfully",
//         user: {
//           user_id: user.user_id,
//           first_name: user.first_name,
//           middle_name: user.middle_name,
//           last_name: user.last_name,
//           email: user.email,
//           role: user.role,
//           password: user.password,
//           createdAt: user.createdAt,
//         },
//         student: {
//           tup_id: student.tup_id,
//           college: student.college,
//           scanned_id: student.scanned_id,
//           photo_with_id: student.photo_with_id,
//         },
//       });
//     } catch (error) {
//       console.error("Error retrieving user information:", error);
//       res.status(500).json({
//         message: "Error retrieving user information",
//         error: error.message,
//       });
//     }
//   };


