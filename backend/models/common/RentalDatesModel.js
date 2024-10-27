const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class RentalDate extends Model {} // Renamed to RentalDate for clarity

    RentalDate.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY, // Use DATEONLY to store date only
            allowNull: false,
        },
        item_type: {
            type: DataTypes.ENUM('listing', 'post', 'item_for_sale'),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'RentalDate', // Updated to reflect the new class name
        tableName: 'dates', // Changed to align with the naming
        timestamps: false, // or true if you want timestamps
    });

    RentalDate.associate = (models) => {
        // Define associations based on item_type
        // RentalDate.belongsTo(models.Listing, {
        //     foreignKey: 'item_id',
        //     constraints: false, // This prevents Sequelize from enforcing the FK constraint
        //     scope: {
        //         item_type: 'listing', // Only link to listings
        //     },
        //     as: 'listing', // Use when item_type is 'listing'
        // });

        // RentalDate.belongsTo(models.Post, {
        //     foreignKey: 'item_id',
        //     constraints: false,
        //     scope: {
        //         item_type: 'post', // Only link to posts
        //     },
        //     as: 'post', // Use when item_type is 'post'
        // });

        // If you still want to include ItemForSale, uncomment this
        // RentalDate.belongsTo(models.ItemForSale, {
        //     foreignKey: 'item_id',
        //     constraints: false,
        //     scope: {
        //         item_type: 'item_for_sale', // Only link to items for sale
        //     },
        //     as: 'itemForSale', 
        // });

        // Associate with durations
        RentalDate.hasMany(models.RentalDuration, {
            foreignKey: 'date_id',
            as: 'durations', 
        });
    };

    return RentalDate; // Return the updated class
};
