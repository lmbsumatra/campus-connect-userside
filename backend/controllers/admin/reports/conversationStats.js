
const { Op } = require("sequelize");
const { models } = require("../../../models");

const conversationStats = async () => {
  try {
    const totalConversations = await models.Conversation.count();
    const activeConversations = await models.Conversation.count({
      where: {
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });
    const conversationData = await models.Conversation.findAll();
    
    const totalMembers = conversationData.reduce(
      (sum, conv) => sum + conv.members.length,
      0
    );
    const avgMembersPerConversation =
      totalConversations > 0 ? totalMembers / totalConversations : 0;

    return {
      totalConversations,
      activeConversations,
      avgMembersPerConversation,
    };
  } catch (error) {
    console.error("Error fetching conversation stats:", error);
    throw error;
  }
};

module.exports = conversationStats;