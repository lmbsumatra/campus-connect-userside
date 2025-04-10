const { models } = require("../models/index");
const { User, Post, Listing, RentalTransaction, Report, ItemForSale } = models;
const { Sequelize, Op } = require("sequelize");

exports.getAllRecentActivities = async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      where: {
        role: {
          [Op.notIn]: ["admin", "superadmin"], // Exclude admin roles
        },
      },
      limit: 10,
      order: [["createdAt", "DESC"]],
    });
    const recentUpdatedUsers = await User.findAll({
      where: {
        updatedAt: {
          [Op.ne]: Sequelize.col("createdAt"), // Ensures it was updated, not just created
        },
        role: {
          [Op.notIn]: ["admin", "superadmin"], // Exclude admin roles
        },
      },
      limit: 10,
      order: [["updatedAt", "DESC"]],
    });
    const recentPosts = await Post.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "renter", attributes: ["first_name", "last_name"] },
      ],
    });
    const recentUpdatedPosts = await Post.findAll({
      where: {
        updated_at: {
          [Op.ne]: Sequelize.col("created_at"), // Ensure it's an actual update
        },
      },
      limit: 10,
      order: [["updated_at", "DESC"]],
      include: [
        { model: User, as: "renter", attributes: ["first_name", "last_name"] },
      ],
    });
    const recentListings = await Listing.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
    });
    const recentUpdatedListings = await Listing.findAll({
      where: {
        updated_at: {
          [Op.ne]: Sequelize.col("created_at"), // Ensures it was updated after creation
        },
      },
      limit: 10,
      order: [["updated_at", "DESC"]],
    });
    const recentTransactions = await RentalTransaction.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "renter", attributes: ["first_name", "last_name"] },
        { model: User, as: "owner", attributes: ["first_name", "last_name"] },
        { model: User, as: "buyer", attributes: ["first_name", "last_name"] },
        {
          model: models.Listing,
          attributes: ["listing_name"],
        },
        {
          model: models.ItemForSale,
          attributes: ["item_for_sale_name"],
        },
      ],
    });
    const recentReports = await Report.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["first_name", "last_name"],
        },
        {
          model: User,
          as: "reportedUser",
          attributes: ["first_name", "last_name"],
        },
        {
          model: Listing,
          as: "reportedListing",
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
        {
          model: Post,
          as: "reportedPost",
          include: [
            {
              model: User,
              as: "renter",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
        {
          model: ItemForSale,
          as: "reportedSale",
          include: [
            {
              model: User,
              as: "seller",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
      ],
    });
    const recentSales = await ItemForSale.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "seller", attributes: ["first_name", "last_name"] },
      ],
    });
    const recentUpdatedSales = await ItemForSale.findAll({
      where: {
        updated_at: {
          [Op.ne]: Sequelize.col("created_at"), // Ensures it was updated after creation
        },
      },
      limit: 10,
      order: [["updated_at", "DESC"]],
      include: [
        { model: User, as: "seller", attributes: ["first_name", "last_name"] },
      ],
    });
    // const recentBuyAndSellTransactions = await BuyAndSellTransaction.findAll({limit: 5,order: [['createdAt', 'DESC']],include: [{ model: User, as: 'buyer', attributes: ['first_name', 'last_name'] },{ model: User, as: 'seller', attributes: ['first_name', 'last_name'] },]});

    const activities = [
      // NEW USER
      ...recentUsers.map((user) => ({
        type: "New User",
        description: `${user.first_name} ${user.last_name} (${user.email}) signed up.`,
        date: user.createdAt,
        userId: user.user_id,
      })),
      // UPDATE USER
      ...recentUpdatedUsers.map((user) => ({
        type: "User Update",
        description: `${user.first_name} ${user.last_name} (${user.email}) updated their profile.`,
        date: user.updatedAt,
        userId: user.user_id,
      })),

      // NEW POST
      ...recentPosts.map((post) => {
        const renterName = post.renter
          ? `${post.renter.first_name} ${post.renter.last_name}`
          : "Unknown User";

        return {
          type: "New Post",
          description: `${
            post.post_item_name || "Unnamed Post"
          } created by ${renterName}.`,
          date: post.created_at,
          postId: post.id,
        };
      }),
      // UPDATE POST
      ...recentUpdatedPosts.map((post) => {
        const renterName = post.renter
          ? `${post.renter.first_name} ${post.renter.last_name}`
          : "Unknown User";

        return {
          type: "Post Update",
          description: `${
            post.post_item_name || "Unnamed Post"
          } updated by ${renterName}.`,
          date: post.updated_at,
          postId: post.id, // Include post ID for navigation
        };
      }),

      // New  Listings
      ...recentListings.map((listing) => ({
        type: "New Listing",
        description: `${
          listing.listing_name || "Unnamed Listing"
        } listed under ${listing.category}.`,
        date: listing.created_at,
        listingId: listing.id,
      })),
      // Updated Listings
      ...recentUpdatedListings.map((listing) => ({
        type: "Listing Update",
        description: `${
          listing.listing_name || "Unnamed Listing"
        } updated under ${listing.category}.`,
        date: listing.updated_at,
        listingId: listing.id,
      })),

      ...recentTransactions.map((transaction) => {
        const ownerName = transaction.owner
          ? `${transaction.owner.first_name} ${transaction.owner.last_name}`
          : "Unknown Owner";

        const renterName = transaction.renter
          ? `${transaction.renter.first_name} ${transaction.renter.last_name}`
          : null;

        const buyerName = transaction.buyer
          ? `${transaction.buyer.first_name} ${transaction.buyer.last_name}`
          : null;

        const isRental = transaction.transaction_type === "rental";
        const isSale = transaction.transaction_type === "sell";

        const listingName = transaction.Listing?.listing_name || null;
        const itemForSaleName =
          transaction.ItemForSale?.item_for_sale_name || null;
        const itemDescription = [listingName, itemForSaleName]
          .filter(Boolean)
          .join(" / ");

        return {
          type: isRental ? "New Rental Transaction" : "New Sale Transaction",
          description: isRental
            ? `Rental transaction between ${ownerName} and ${renterName} for item: ${itemDescription}`
            : `Sale transaction between ${ownerName} and ${buyerName} for item: ${itemDescription}`,
          date: transaction.createdAt,
          transactionId: transaction.id,
        };
      }),

      ...recentReports.map((report) => {
        const reporterName = report.reporter
          ? `${report.reporter.first_name} ${report.reporter.last_name}`
          : "Unknown Reporter";

        let reportedEntityDetails = "";

        if (report.entity_type === "user") {
          // If the reported entity is a user, get the reported user's name
          const reportedUserName = report.reportedUser
            ? `${report.reportedUser.first_name} ${report.reportedUser.last_name}`
            : "Unknown User";
          reportedEntityDetails = `User: ${reportedUserName} (ID: ${report.reported_entity_id})`;
        } else if (report.entity_type === "listing") {
          // If the reported entity is a listing, get the listing's owner name
          const listingOwnerName = report.reportedListing?.owner
            ? `${report.reportedListing.owner.first_name} ${report.reportedListing.owner.last_name}`
            : "Unknown Owner";
          reportedEntityDetails = `Listing: ${report?.reportedListing?.listing_name} (ID: ${report.reported_entity_id}, Owner: ${listingOwnerName})`;
        } else if (report.entity_type === "post") {
          // If the reported entity is a post, get the renter's name
          const postRenterName = report.reportedPost?.renter
            ? `${report.reportedPost.renter.first_name} ${report.reportedPost.renter.last_name}`
            : "Unknown Renter";
          reportedEntityDetails = `Post: ${
            report.reportedPost?.post_item_name || "Unnamed Post"
          } (ID: ${report.reported_entity_id}, Renter: ${postRenterName})`;
        } else if (report.entity_type === "sale") {
          // If the reported entity is a sale, get the seller's name
          const sellerName = report.reportedSale?.seller
            ? `${report.reportedSale.seller.first_name} ${report.reportedSale.seller.last_name}`
            : "Unknown Seller";
          reportedEntityDetails = `Sale Item: ${
            report.reportedSale?.item_for_sale_name || "Unnamed Sale"
          } (ID: ${report.reported_entity_id}, Seller: ${sellerName})`;
        } else {
          // For other entity types, just show the ID
          reportedEntityDetails = `${report.entity_type} (ID: ${report.reported_entity_id})`;
        }

        return {
          type: "New Report",
          description: `Report filed by ${reporterName} regarding ${reportedEntityDetails}.`,
          date: report.createdAt,
          entity_type: report.entity_type,
          entity_id: report.reported_entity_id,
        };
      }),

      // New sale
      ...recentSales.map((sale) => {
        const sellerName = sale.seller
          ? `${sale.seller.first_name} ${sale.seller.last_name}`
          : "Unknown Seller";

        return {
          type: "New Sale",
          description: `${sale.item_for_sale_name} listed by ${sellerName}.`,
          date: sale.created_at,
          saleId: sale.id,
        };
      }),
      // Updated Sales Listings
      ...recentUpdatedSales.map((sale) => {
        const sellerName = sale.seller
          ? `${sale.seller.first_name} ${sale.seller.last_name}`
          : "Unknown Seller";

        return {
          type: "Sale Update",
          description: `${sale.item_for_sale_name} updated by ${sellerName}.`,
          date: sale.updated_at,
          saleId: sale.id,
        };
      }),
      // ...recentBuyAndSellTransactions.map(transaction => ({
      //     type: 'New Buy and Sell Transaction',
      //     description: `Transaction between ${transaction.buyer.first_name} ${transaction.buyer.last_name} and ${transaction.seller.first_name} ${transaction.seller.last_name} with TransactionID:${transaction.id}.`,
      //     date: transaction.createdAt,
      // }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch recent activities." });
  }
};
