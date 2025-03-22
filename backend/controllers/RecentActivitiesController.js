const { models } = require("../models/index");
const {
  User,
  Post,
  Listing,
  RentalTransaction,
  Report,
  ItemForSale,
  BuyAndSellTransaction,
} = models;

exports.getAllRecentActivities = async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
    });
    const recentPosts = await Post.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "renter", attributes: ["first_name", "last_name"] },
      ],
    });
    const recentListings = await Listing.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
    });
    const recentTransactions = await RentalTransaction.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "renter", attributes: ["first_name", "last_name"] },
        { model: User, as: "owner", attributes: ["first_name", "last_name"] },
        {
          model: models.Listing, // ✅ Ensure Listing is included
          attributes: ["listing_name"],
        },
      ],
    });
    const recentReports = await Report.findAll({
      limit: 5,
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
      ],
    });
    const recentSales = await ItemForSale.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "seller", attributes: ["first_name", "last_name"] },
      ],
    });
    // const recentBuyAndSellTransactions = await BuyAndSellTransaction.findAll({limit: 5,order: [['createdAt', 'DESC']],include: [{ model: User, as: 'buyer', attributes: ['first_name', 'last_name'] },{ model: User, as: 'seller', attributes: ['first_name', 'last_name'] },]});

    const activities = [
      ...recentUsers.map((user) => ({
        type: "New User",
        description: `${user.first_name} ${user.last_name} (${user.email}) signed up.`,
        date: user.createdAt,
      })),
      ...recentPosts.map((post) => {
        // Check if post.renter exists before accessing its properties
        const renterName = post.renter
          ? `${post.renter.first_name} ${post.renter.last_name}`
          : "Unknown User";

        return {
          type: "New Post",
          description: `${
            post.post_item_name || "Unnamed Post"
          } created by ${renterName}.`,
          date: post.created_at,
        };
      }),
      ...recentListings.map((listing) => ({
        type: "New Listing",
        description: `${
          listing.listing_name || "Unnamed Listing"
        } listed under ${listing.category}.`,
        date: listing.created_at,
      })),
      ...recentTransactions.map((transaction) => {
        // Check if owner and renter exist before accessing their properties
        const ownerName = transaction.owner
          ? `${transaction.owner.first_name} ${transaction.owner.last_name}`
          : "Unknown Owner";

        const renterName = transaction.renter
          ? `${transaction.renter.first_name} ${transaction.renter.last_name}`
          : "Unknown Renter";

        return {
          type: "New Rental Transaction",
          description: `Transaction between ${ownerName} and ${renterName} with Transaction Item Name:${transaction.Listing?.listing_name}.`,
          date: transaction.createdAt,
        };
      }),
      ...recentReports.map((report) => {
        // Check if reporter exists before accessing its properties
        const reporterName = report.reporter
          ? `${report.reporter.first_name} ${report.reporter.last_name}`
          : "Unknown Reporter";

        let reportedEntityDetails = "";

        if (report.entity_type === "user") {
          // If the reported entity is a user, get the reported user's name
          const reportedUserName = report.reportedUser
            ? `${report.reportedUser.first_name} ${report.reportedUser.last_name}`
            : "Unknown User";
          reportedEntityDetails = `user: ${reportedUserName} (ID: ${report.reported_entity_id})`;
        } else if (report.entity_type === "listing") {
          // If the reported entity is a listing, get the listing's owner name
          const listingOwnerName = report.reportedListing?.owner
            ? `${report.reportedListing.owner.first_name} ${report.reportedListing.owner.last_name}`
            : "Unknown Owner";
          reportedEntityDetails = `listing: ${report.reportedListing.listing_name} (ID: ${report.reported_entity_id}, Owner: ${listingOwnerName})`;
        } else {
          // For other entity types, just show the ID
          reportedEntityDetails = `${report.entity_type} (ID: ${report.reported_entity_id})`;
        }

        return {
          type: "New Report",
          description: `Report filed by ${reporterName} regarding ${reportedEntityDetails}.`,
          date: report.createdAt,
        };
      }),
      ...recentSales.map((sale) => {
        // Check if seller exists before accessing its properties
        const sellerName = sale.seller
          ? `${sale.seller.first_name} ${sale.seller.last_name}`
          : "Unknown Seller";

        return {
          type: "New Sale",
          description: `${sale.item_for_sale_name} listed by ${sellerName}.`,
          date: sale.created_at,
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
