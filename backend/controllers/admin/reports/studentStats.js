const { models, sequelize } = require("../../../models");

const studentStats = async () => {
  try {
    // Number of Students per College
    const studentsPerCollege = await models.Student.findAll({
      attributes: ["college", [sequelize.fn("COUNT", "*"), "count"]],
      group: ["college"],
      raw: true,
    });

    // Number of Students per Course
    const studentsPerCourse = await models.Student.findAll({
      attributes: ["course", [sequelize.fn("COUNT", "*"), "count"]],
      group: ["course"],
      raw: true,
    });

    // Verification Status Distribution
    const studentStatusDistribution = await models.Student.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
      group: ["status"],
      raw: true,
    });

    // Growth in Student Registrations Over Time
    const studentGrowthOverTime = await models.Student.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"), "month"],
        [sequelize.fn("COUNT", "*"), "count"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    });

    return {
      studentsPerCollege,
      studentsPerCourse,
      studentStatusDistribution,
      studentGrowthOverTime,
    };
  } catch (error) {
    console.error("Error fetching student statistics:", error);
    throw error;
  }
};

module.exports = studentStats;
