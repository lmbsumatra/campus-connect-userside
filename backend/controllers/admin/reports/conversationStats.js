const { Op } = require("sequelize");
const { models } = require("../../../models");

const conversationStats = async () => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

    // Total Conversations
    const totalConversations = await models.Conversation.count();

    // Active Conversations (last 7 days)
    const activeConversations = await models.Conversation.count({
      where: {
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Conversations for Current Month
    const totalConversationsCurrentMonth = await models.Conversation.count({
      where: { createdAt: { [Op.gte]: startOfCurrentMonth } },
    });

    // Conversations for Past Month
    const totalConversationsPastMonth = await models.Conversation.count({
      where: {
        createdAt: { [Op.between]: [startOfPastMonth, endOfPastMonth] },
      },
    });

    // Fetch All Conversation Data
    const conversationData = await models.Conversation.findAll();

    // Calculate total members
    const totalMembers = conversationData.reduce(
      (sum, conv) => sum + conv.members.length,
      0
    );

    // Calculate average members per conversation
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
