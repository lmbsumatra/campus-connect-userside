const readline = require("readline");
const bcrypt = require("bcryptjs");
const sequelize = require("./config/database");

const User = require("./models/UserModel");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function updateAdminPassword() {
  try {
    rl.question("Enter admin/superadmin email: ", async (email) => {
      const user = await User.findOne({
        where: {
          email,
          role: ["admin", "superadmin"],
        },
      });

      if (!user) {
        console.log("Admin or Superadmin not found.");
        rl.close();
        return;
      }

      rl.question("Enter new password: ", async (newPassword) => {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        console.log(`${user.role} password updated successfully.`);
        rl.close();
        await sequelize.close();
      });
    });
  } catch (error) {
    console.error("Error updating password:", error.message);
    await sequelize.close();
  }
}

updateAdminPassword();
