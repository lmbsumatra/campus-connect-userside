const { models } = require("../../models");
const sequelize = require("../../config/database");
const Fuse = require("fuse.js");

const matchedItems = async (req, res) => {
  try {
    const post = await models.Post.findOne({
      where: {
        id: req.params.id,
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          where: {
            status: "available",
            item_type: "post",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              where: { status: "available" },
            },
          ],
        },
        {
          model: models.User,
          as: "renter",
          include: [{ model: models.Student, as: "student" }],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const formattedPost = {
      id: post.id,
      name: post.post_item_name,
      tags: JSON.parse(post.tags),
      price: post.price,
      createdAt: post.created_at,
      status: post.status,
      category: post.category,
      itemType: "To Rent",
      desc: post.description,
      specs: post.specifications,
      images: JSON.parse(post.images),
      rentalDates: post.rental_dates.map((date) => ({
        id: date.id,
        postId: date.post_id,
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
      renter: {
        id: post.renter_id,
        fname: post.renter.first_name,
        lname: post.renter.last_name,
        college: post.renter.student.college,
      },
    };

    const itemsForSale = await models.ItemForSale.findAll({
      attributes: [
        "id",
        "item_for_sale_name",
        "tags",
        "price",
        "seller_id",
        "created_at",
        "status",
        "category",
        "images",
        "item_condition",
        "delivery_mode",
        "payment_mode",
      ],
      where: {
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: true,
          where: { item_type: "item_for_sale" },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
            },
          ],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["first_name", "last_name"],
          include: [
            { model: models.Student, as: "student", attributes: ["college"] },
          ],
        },
      ],
    });

    const itemsForRent = await models.Listing.findAll({
      where: {
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: true,
          where: {
            item_type: "listing",
            status: "available",
          },
          include: [
            {
              model: models.Duration,
              as: "durations",
              required: true,
              where: {
                status: "available",
              },
            },
          ],
        },
        {
          model: models.User,
          as: "owner",
          attributes: ["first_name", "last_name"],
          include: [
            { model: models.Student, as: "student", attributes: ["college"] },
          ],
        },
      ],
    });

    const formattedItems = [
      ...itemsForSale.map((item) => ({
        id: item.id,
        name: item.item_for_sale_name,
        tags: JSON.parse(item.tags),
        price: item.price,
        createdAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "For Sale",
        images: JSON.parse(item.images),
        deliveryMethod: item.delivery_mode,
        paymentMethod: item.payment_mode,
        condition: item.item_condition,
        availableDates: item.available_dates.map((date) => ({
          id: date.id,
          itemId: date.item_id,
          date: date.date,
          itemType: date.item_type,
          status: date.status,
          durations: date.durations.map((duration) => ({
            id: duration.id,
            dateId: date.id, // Ensuring correct reference
            timeFrom: duration.rental_time_from,
            timeTo: duration.rental_time_to,
            status: duration.status,
          })),
        })),
        sellerId: item.seller_id,
        sellerFname: item.seller.first_name,
        sellerLname: item.seller.last_name,
        college: item.seller.student ? item.seller.student.college : null, // Fixing the college reference
      })),
      ...itemsForRent.map((item) => ({
        id: item.id,
        name: item.listing_name,
        tags: JSON.parse(item.tags),
        price: item.rate,
        createdAt: item.created_at,
        status: item.status,
        category: item.category,
        itemType: "For Rent",
        images: JSON.parse(item.images),
        deliveryMethod: item.delivery_mode,
        paymentMethod: item.payment_mode,
        condition: item.item_condition,
        lateCharges: item.late_charges,
        securityDeposit: item.security_deposit,
        repairReplacement: item.repair_replacement,
        availableDates: item.rental_dates.map((date) => ({
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
        owner: {
          id: item.owner_id,
          fname: item.owner.first_name,
          lname: item.owner.last_name,
        },
        college: item.owner.student ? item.owner.student.college : null,
      })),
    ];

    const fuse = new Fuse(formattedItems, {
      keys: ["name"],
      threshold: 0.7,
    });

    // console.log("here", typeof formattedPost.name, formattedPost.name);

    const results = fuse
      .search(formattedPost.name)
      .map((result) => result.item);

    res.status(200).json({ matchedItems: results });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = matchedItems;
