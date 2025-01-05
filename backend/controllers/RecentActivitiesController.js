const { models } = require('../models/index');
const { User, Post, Listing, RentalTransaction, Report, ItemForSale, BuyAndSellTransaction } = models;

exports.getAllRecentActivities = async (req, res) => {
    try {
        const recentUsers = await User.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        const recentPosts = await Post.findAll({limit: 5, order: [['created_at', 'DESC']], include: [{model: User, as: 'renter', attributes: ['first_name', 'last_name'],  }]});
        const recentListings = await Listing.findAll({ limit: 5, order: [['created_at', 'DESC']] });
        const recentTransactions = await RentalTransaction.findAll({limit: 5,order: [['createdAt', 'DESC']],include: [{ model: User, as: 'renter', attributes: ['first_name', 'last_name'] },{ model: User, as: 'owner', attributes: ['first_name', 'last_name'] },]});
        const recentReports = await Report.findAll({ limit: 5, order: [['createdAt', 'DESC']], include: [{ model: User, as: 'reporter', attributes: ['first_name', 'last_name'] }] });
        const recentSales = await ItemForSale.findAll({limit: 5, order: [['created_at', 'DESC']], include: [{ model: User, as: 'seller', attributes: ['first_name', 'last_name'] }]});
        const recentBuyAndSellTransactions = await BuyAndSellTransaction.findAll({limit: 5,order: [['createdAt', 'DESC']],include: [{ model: User, as: 'buyer', attributes: ['first_name', 'last_name'] },{ model: User, as: 'seller', attributes: ['first_name', 'last_name'] },]});

        const activities = [
            ...recentUsers.map(user => ({
                type: 'New User',
                description: `${user.first_name} ${user.last_name} (${user.email}) signed up.`,
                date: user.createdAt,
            })),
            ...recentPosts.map(post => ({
                type: 'New Post',
                description: `${post.post_item_name || 'Unnamed Post' } created by ${post.renter.first_name} ${post.renter.last_name}.`,
                date: post.created_at,
            })),
            ...recentListings.map(listing => ({
                type: 'New Listing',
                description: `${listing.listing_name || 'Unnamed Listing' } listed under ${listing.category}.`,
                date: listing.created_at,
            })),
            ...recentTransactions.map(transaction => ({
                type: 'New Rental Transaction',
                description: `Transaction between ${transaction.owner.first_name} ${transaction.owner.last_name} and ${transaction.renter.first_name} ${transaction.renter.last_name} with TransactionID:${transaction.id}.`,
                date: transaction.createdAt,
            })),
            ...recentReports.map(report => ({
                type: 'New Report',
                description: `Report filed by ${report.reporter.first_name} ${report.reporter.last_name} regarding ${report.entity_type} (${report.reported_entity_id}).`,
                date: report.createdAt,
            })),
            ...recentSales.map(sale => ({
                type: 'New Sale',
                description: `${sale.item_for_sale_name} listed by ${sale.seller.first_name} ${sale.seller.last_name}.`,
                date: sale.created_at,
            })),
            ...recentBuyAndSellTransactions.map(transaction => ({
                type: 'New Buy and Sell Transaction',
                description: `Transaction between ${transaction.buyer.first_name} ${transaction.buyer.last_name} and ${transaction.seller.first_name} ${transaction.seller.last_name} with TransactionID:${transaction.id}.`,
                date: transaction.createdAt,
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch recent activities.' });
    }
};
