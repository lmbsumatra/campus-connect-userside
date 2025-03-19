// Register Admin
const User = require("../../models/UserModel");
const Admin = require("../../models/AdminModel");
const sequelize = require("../../config/database");
const bcrypt = require("bcrypt");
const { rollbackUpload } = require("../../config/multer");

const registerAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  let publicIds = [];

  try {
    const { first_name, middle_name, last_name, email, password } = req.body;

    const profile_pic = req.file;

    if (!first_name || !last_name || !email || !password || !profile_pic) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePicPath = profile_pic.path || profile_pic.filename;
    publicIds.push(profilePicPath);

    const newUser = await User.create(
      {
        first_name,
        middle_name,
        last_name,
        role: "admin",
        email,
        password: hashedPassword,
      },
      { transaction: t }
    );
    // console.log("New User Created:", newUser);

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

module.exports = registerAdmin;
