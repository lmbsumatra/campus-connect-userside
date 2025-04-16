const { Op } = require("sequelize");
const { models } = require("../../models/index");

const getAllItemForSaleByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const items = await models.ItemForSale.findAll({
      where: {
        seller_id: userId,
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: false,
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: false,
              where: { status: "available" },
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
      ],
    });

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        let tags = [];
        let images = [];
        try {
          tags = JSON.parse(item.tags || "[]");
          images = JSON.parse(item.images || "[]");
        } catch (e) {}

        // Fetch org info if the seller is a representative
        const org = await models.Org.findOne({
          where: { user_id: item.seller_id },
          include: [
            { model: models.OrgCategory, as: "category" },
            { model: models.User, as: "representative" },
          ],
        });

        return {
          id: item.id,
          name: item.item_for_sale_name,
          tags,
          price: item.price,
          createAt: item.created_at,
          status: item.status,
          category: item.category,
          itemType: "For Sale",
          location: item.location,
          images,
          availableDates: item.available_dates.map((date) => ({
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
          })),
          seller: {
            id: item.seller.user_id,
            fname: item.seller.first_name,
            lname: item.seller.last_name,
            email: item.seller.email,
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
        };
      })
    );

    res.status(200).json(formattedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getAllItemForSaleByUser;
