const { models } = require("../../models/index");

const getItemForSaleById = async (req, res) => {
  try {
    const item = await models.ItemForSale.findByPk(req.params.itemForSaleId, {
      include: [
        {
          model: models.Date,
          as: "available_dates",
          include: [
            {
              model: models.Duration,
              as: "durations",
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          include: [
            {
              model: models.Student,
              as: "student",
            },
          ],
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Fetch org data if this seller is a representative
    const org = await models.Org.findOne({
      where: { user_id: item.seller.user_id },
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    const formattedItem = {
      id: item.id,
      itemName: item.item_for_sale_name,
      images: JSON.parse(item.images || "[]"),
      tags: JSON.parse(item.tags || "[]"),
      price: item.price,
      createdAt: item.created_at,
      deliveryMethod: item.delivery_mode,
      itemCondition: item.item_condition,
      paymentMethod: item.payment_mode,
      statusMessage: item.status_message,
      stock: item.stock,
      status: item.status,
      category: item.category,
      itemType: "For Sale",
      desc: item.description,
      specs: JSON.parse(item.specifications || "{}"),
      location: item.location,
      availableDates: item.available_dates.map((date) => ({
        id: date.id,
        itemId: date.item_id,
        date: date.date,
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
    };

    res.status(200).json(formattedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getItemForSaleById;
