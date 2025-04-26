const { Op } = require("sequelize");
const { models } = require("../../models");

const getAvailableItemsForSaleByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.ItemForSale.findAll({
      where: {
        status: "approved",
        seller_id: userId,
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: true,
          where: {
            item_type: "item_for_sale",
            status: "available",
            date: {
              [Op.gte]: new Date(),
            },
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
              where: { status: "available" },
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["user_id", "first_name", "last_name"],
          where: { email_verified: true },
          include: [
            {
              model: models.Student,
              as: "student",
              attributes: ["college", "profile_pic"],
              where: { status: "verified" },
            },
          ],
        },
        {
          model: models.ReviewAndRate,
          as: "reviews",
          where: { review_type: "item" },
          attributes: ["rate"],
          required: false,
        },
      ],
    });

    // Fetch organization info once (not per item)
    const org = await models.Org.findOne({
      where: { user_id: userId },
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    if (!org || !org.is_active || !org.is_verified) {
      return res
        .status(404)
        .json({ error: "Organization is not active or verified" });
    }

    const formattedItems = items
      .map((item) => {
        try {
          const parsedTags = item.tags ? JSON.parse(item.tags) : [];
          const parsedImages = item.images ? JSON.parse(item.images) : [];
          const reviews = item.reviews || [];
          const averageRating = reviews.length
            ? reviews.reduce((sum, review) => sum + review.rate, 0) /
              reviews.length
            : null;

          const availableDates = item.available_dates.map((date) => ({
            id: date.id,
            itemId: date.item_id,
            date: date.date,
            itemType: date.item_type,
            status: date.status,
            durations: date.durations.map((duration) => ({
              id: duration.id,
              dateId: duration.date_id,
              timeFrom: duration.rental_time_from,
              timeTo: duration.rental_time_to,
              status: duration.status,
            })),
          }));

          return availableDates.length > 0
            ? {
                id: item.id,
                name: item.item_for_sale_name,
                tags: parsedTags,
                price: parseFloat(item.price),
                createAt: item.created_at,
                status: item.status,
                category: item.category,
                itemType: "For Sale",
                images: parsedImages,
                itemCondition: item.listing_condition,
                deliveryMethod: item.delivery_mode,
                lateCharges: item.late_charges,
                securityDeposit: item.security_deposit,
                repairReplacement: item.repair_replacement,
                paymentMethod: item.payment_mode,
                specs: item.specifications,
                location: item.location,
                averageRating: Number(averageRating) || 0,
                availableDates,
                stock: item.current_stock,
                seller: {
                  id: item.seller.user_id,
                  fname: item.seller.first_name,
                  lname: item.seller.last_name,
                  college: item.seller.student.college,
                  profilePic: item.seller.student.profile_pic,
                },
                hasRepresentative: !!org,
                organization: org
                  ? {
                      id: org.org_id,
                      name: org.name,
                      description: org.description,
                      logo: org.logo,
                      isVerified: org.is_verified,
                      isActive: org.is_active,
                      createdAt: org.created_at,
                      updatedAt: org.updated_at,
                      category: org.category
                        ? {
                            id: org.category.id,
                            name: org.category.name,
                          }
                        : null,
                      representative: org.representative
                        ? {
                            id: org.representative.user_id,
                            email: org.representative.email,
                            name: `${org.representative.first_name} ${org.representative.last_name}`,
                          }
                        : null,
                    }
                  : null,
              }
            : null;
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);

    res.status(200).json(formattedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAvailableItemsForSaleByUser;
