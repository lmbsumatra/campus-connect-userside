const cron = require("node-cron");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const EndSemesterDate = require("../models/EndSemesterDate");
// const { Student } = require("../models/StudentModel");
const moment = require("moment-timezone");
const Student = require("../models/StudentModel");

cron.schedule("*/1 * * * *", async () => {
  try {
    // console.log("Cron job started...");

    // Get today's date in Asia/Manila timezone and format it to YYYY-MM-DD
    const formattedToday = moment.tz("Asia/Manila").format("YYYY-MM-DD");
    console.log("Today (GMT+8):", formattedToday);

    // Fetch all records for debugging
    const allDates = await EndSemesterDate.findAll();
    // console.log("All EndSemesterDate Records in DB:", JSON.stringify(allDates, null, 2));

    // Fetch the end semester date in UTC
    const endSemesterDate = await EndSemesterDate.findOne({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("date")),  // Extracts date part only from the database
        formattedToday  // Comparing with the formattedToday (which is in YYYY-MM-DD format)
      ),
    });

    // console.log("Matching Record:", endSemesterDate);

    if (endSemesterDate) {
    //   console.log("End semester date found. Resetting student statuses to 'pending'...");
      await Student.update(
        { status: "pending" },
        { where: {
            [Op.or]: [
              { status: { [Op.ne]: "pending" } },
              { status: null }
            ]
          } }
      );
    //   console.log("Student statuses have been reset to 'pending'.");
    } else {
      console.log("No matching end semester date found.");
    }
  } catch (error) {
    console.error("Error in cron job: ", error);
  }
});