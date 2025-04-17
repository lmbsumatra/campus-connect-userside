const { Op } = require("sequelize");
const { models } = require("../../../models");

const conversationStats = async ({ month, year }) => {
  try {
    const selectedMonth = parseInt(month) - 1; // 0-indexed
    const selectedYear = parseInt(year);

    const startOfCurrentMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0);

    const startOfPastMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const endOfPastMonth = new Date(selectedYear, selectedMonth, 0);

    // Total Conversations in selected month
    const totalConversations = await models.Conversation.count({
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
    });

    // Active Conversations (updated in the last 7 days)
    const activeConversations = await models.Conversation.count({
      where: {
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Conversations in selected month
    const totalConversationsCurrentMonth = totalConversations;

    // Conversations in past month
    const totalConversationsPastMonth = await models.Conversation.count({
      where: {
        createdAt: {
          [Op.between]: [startOfPastMonth, endOfPastMonth],
        },
      },
    });

    // Fetch conversations for average member calculation (only in current month)
    const conversationData = await models.Conversation.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
    });

    const totalMembers = conversationData.reduce(
      (sum, conv) => sum + (conv.members?.length || 0),
      0
    );

    const avgMembersPerConversation =
      totalConversations > 0 ? totalMembers / totalConversations : 0;

    return {
      totalConversations,
      activeConversations,
      avgMembersPerConversation,
      currentMonth: {
        totalConversations: totalConversationsCurrentMonth,
      },
      pastMonth: {
        totalConversations: totalConversationsPastMonth,
      },
    };
  } catch (error) {
    console.error("Error fetching conversation stats:", error);
    throw error;
  }
};

module.exports = conversationStats;
