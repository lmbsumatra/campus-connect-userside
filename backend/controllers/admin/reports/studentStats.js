const { models, sequelize} = require("../../../models");
const { Op } = require("sequelize");

const studentStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Number of Students per College
    const studentsPerCollegeCurrentMonth = await models.Student.findAll({
      attributes: ["college", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["college"],
      raw: true,
    });

    const studentsPerCollegePastMonth = await models.Student.findAll({
      attributes: ["college", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["college"],
      raw: true,
    });

    // Number of Students per Course
    const studentsPerCourseCurrentMonth = await models.Student.findAll({
      attributes: ["course", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["course"],
      raw: true,
    });

    const studentsPerCoursePastMonth = await models.Student.findAll({
      attributes: ["course", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["course"],
      raw: true,
    });

    // Verification Status Distribution
    const studentStatusDistributionCurrentMonth = await models.Student.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["status"],
      raw: true,
    });

    const studentStatusDistributionPastMonth = await models.Student.findAll({
      attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["status"],
      raw: true,
    });

    // Growth in Student Registrations Over Time (Comparison of two months)
    const studentGrowthOverTimeCurrentMonth = await models.Student.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m-%d"), "day"],
        [sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
      group: ["day"],
      order: [["day", "ASC"]],
      raw: true,
    });

    const studentGrowthOverTimePastMonth = await models.Student.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m-%d"), "day"],
        [sequelize.fn("COUNT", "*"), "count"],
      ],
      where: { createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] } },
      group: ["day"],
      order: [["day", "ASC"]],
      raw: true,
    });

    return {
      currentMonth: {
        studentsPerCollege: studentsPerCollegeCurrentMonth,
        studentsPerCourse: studentsPerCourseCurrentMonth,
        studentStatusDistribution: studentStatusDistributionCurrentMonth,
        studentGrowthOverTime: studentGrowthOverTimeCurrentMonth,
      },
      pastMonth: {
        studentsPerCollege: studentsPerCollegePastMonth,
        studentsPerCourse: studentsPerCoursePastMonth,
        studentStatusDistribution: studentStatusDistributionPastMonth,
        studentGrowthOverTime: studentGrowthOverTimePastMonth,
      }
    };
  } catch (error) {
    console.error("Error fetching student statistics:", error);
    throw error;
  }
};

module.exports = studentStats;
