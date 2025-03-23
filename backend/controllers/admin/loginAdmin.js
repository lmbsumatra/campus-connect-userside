const User = require("../../models/UserModel");
const AuditLog = require("../../models/AuditLogModel");
const Admin = require("../../models/AdminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const { Op } = require("sequelize");

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    const user = await User.findOne({
      where: { email, role: { [Op.or]: ["admin", "superadmin"] } },
    });

    if (!user) {
      await AuditLog.create({
        admin_id: null,
        role: "unknown",
        action: "FAILED_LOGIN",
        endpoint: "/admin/login",
        details: JSON.stringify({ email, reason: "Invalid credentials" }),
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await AuditLog.create({
        admin_id: user.user_id,
        role: user.role,
        action: "FAILED_LOGIN",
        endpoint: "/admin/login",
        details: JSON.stringify({ email, reason: "Incorrect password" }),
      });
      return res.status(401).json({ message: "Incorrect password" });
    }

    const admin = await Admin.findOne({ where: { user_id: user.user_id } });
    if (!admin) return res.status(403).json({ message: "Unauthorized access" });

    user.lastlogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_REFRESH_SECRET,
      {
        expiresIn: "5d",
      }
    );

    // ✅ Allow multiple refresh tokens (instead of replacing old ones)
    const storedTokens = Array.isArray(admin.refreshToken)
      ? admin.refreshToken
      : [admin.refreshToken];

    const updatedTokens = [...storedTokens, refreshToken];

    admin.refreshToken = updatedTokens;
    await admin.save();

    await AuditLog.create({
      admin_id: user.user_id,
      role: user.role,
      action: "SUCCESSFUL_LOGIN",
      endpoint: "/admin/login",
      details: JSON.stringify({ email }),
    });

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      role: user.role,
      userId: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

module.exports = loginAdmin;
