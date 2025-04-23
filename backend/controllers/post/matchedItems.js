const { models } = require("../../models");
const sequelize = require("../../config/database");
const Fuse = require("fuse.js");

const parseToArray = (input) => {
  // console.log("parseToArray input:", input);
  if (!input) return [];

  try {
    if (typeof input === "string") {
      input = input.replace(/\s+/g, " ").trim();
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === "object" && parsed !== null) return Object.values(parsed);
      } catch {
        return input === "" ? [] : input.split(" ");
      }
    }
    if (typeof input === "object") return Object.values(input);
    return [];
  } catch (err) {
    console.error("parseToArray error:", err);
    return [];
  }
};

const matchedItems = async (req, res) => {
  try {
    // console.log("Request params:", req.params);

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
      // console.log("Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    // console.log("Fetched Post:", post);

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
      descArray: parseToArray(post.description),
      specs: post.specifications,
      specsArray: parseToArray(post.specifications),
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
        id: post.user_id,
        fname: post.renter.first_name,
        lname: post.renter.last_name,
        college: post.renter.student.college,
      },
    };

    // console.log("Formatted Post:", formattedPost);

    const itemsForSale = await models.ItemForSale.findAll({
      where: {
        status: "approved",
      },
      include: [
        {
          model: models.Date,
          as: "available_dates",
          required: true,
          where: { item_type: "item_for_sale" },
          include: [{ model: models.Duration, as: "durations", required: true }],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["first_name", "last_name"],
          include: [{ model: models.Student, as: "student", attributes: ["college"] }],
        },
      ],
    });

    const itemsForRent = await models.Listing.findAll({
      where: { status: "approved" },
      include: [
        {
          model: models.Date,
          as: "rental_dates",
          required: true,
          where: { item_type: "listing", status: "available" },
          include: [{ model: models.Duration, as: "durations", required: true, where: { status: "available" } }],
        },
        {
          model: models.User,
          as: "owner",
          attributes: ["first_name", "last_name"],
          include: [{ model: models.Student, as: "student", attributes: ["college"] }],
        },
      ],
    });

    // console.log("Items For Sale count:", itemsForSale.length);
    // console.log("Items For Rent count:", itemsForRent.length);

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
        desc: item.description || "",
        descArray: parseToArray(item.description),
        specs: item.specifications || "",
        specsArray: parseToArray(item.specifications),
        availableDates: item.available_dates.map((date) => ({
          id: date.id,
          itemId: date.item_id,
          date: date.date,
          itemType: date.item_type,
          status: date.status,
          durations: date.durations.map((duration) => ({
            id: duration.id,
            dateId: date.id,
            timeFrom: duration.rental_time_from,
            timeTo: duration.rental_time_to,
            status: duration.status,
          })),
        })),
        sellerId: item.seller_id,
        sellerFname: item.seller.first_name,
        sellerLname: item.seller.last_name,
        college: item.seller.student ? item.seller.student.college : null,
      })),
      ...itemsForRent.map((item) => ({
        id: item.id,
        name: item.listing_name,
        tags: JSON.parse(item.tags),
        price: item.rate,
        createdAt: item.created_at,
        status: item.status,
        category: item.category,
        desc: item.description || "",
        descArray: parseToArray(item.description),
        specs: item.specifications || "",
        specsArray: parseToArray(item.specifications),
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

    // console.log("Formatted Items Count:", formattedItems.length);

    const postTags = formattedPost.tags || [];
    const postCategory = formattedPost.category || "";
    const postName = formattedPost.name || "";
    const postDesc = formattedPost.desc || "";
    const postSpecs = formattedPost.specs || "";

    const fuse = new Fuse(formattedItems, {
      keys: ["name", "specsArray", "tags"],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    });

    const searchTermsArray = [
      ...postTags,
      postName,
      postCategory,
      ...formattedPost.specsArray,
      ...formattedPost.descArray,
    ].filter(Boolean);

    // console.log("Search Terms:", searchTermsArray);

    let results = [];
    const seenIds = new Set();

    if (postName) {
      const nameResults = fuse.search(postName);
      // console.log("Name results count:", nameResults.length);
      for (const result of nameResults) {
        if (!seenIds.has(result.item.id)) {
          seenIds.add(result.item.id);
          results.push(result.item);
        }
      }
    }

    for (const term of [...postTags, postCategory]) {
      if (!term) continue;
      const termResults = fuse.search(term);
      // console.log(`Results for term "${term}":`, termResults.length);
      for (const result of termResults) {
        if (!seenIds.has(result.item.id)) {
          seenIds.add(result.item.id);
          results.push(result.item);
        }
      }
    }

    const descWords = postDesc.split(" ").filter((word) => word.length > 3);
    const specWords = postSpecs.split(" ").filter((word) => word.length > 3);

    for (const word of [...descWords, ...specWords]) {
      if (!word) continue;
      const wordResults = fuse.search(word);
      for (const result of wordResults) {
        if (!seenIds.has(result.item.id) && result.score < 0.3) {
          seenIds.add(result.item.id);
          results.push(result.item);
        }
      }
    }

    // console.log("Final matched results count:", results.length);

    return res.status(200).json({ matchedItems: results });
  } catch (error) {
    console.error("Error in matchedItems:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = matchedItems;
