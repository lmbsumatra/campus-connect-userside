const { models } = require("../../../models");


const reportStats = async () => {
  try {
    const totalReports = await models.Report.count();

    const reportsByEntityType = await models.Report.findAll({
      attributes: ['entity_type', [models.Report.sequelize.fn('COUNT', '*'), 'count']],
      group: ['entity_type'],
      raw: true,
    });

    const reportsByStatus = await models.Report.findAll({
      attributes: ['status', [models.Report.sequelize.fn('COUNT', '*'), 'count']],
      group: ['status'],
      raw: true,
    });

    const disputesCount = await models.Report.count({
      where: { is_dispute: true },
    });

    return {
      totalReports,
      reportsByEntityType,
      reportsByStatus,
      disputesCount,
    };
  } catch (error) {
    console.error("Error fetching report statistics:", error);
    throw error;
  }
};

module.exports = reportStats;
