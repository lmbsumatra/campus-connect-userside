// models/ListingRentalDate.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ListingRentalDate extends Model {}

    ListingRentalDate.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        listing_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'listings',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        rental_date: {
            type: DataTypes.DATEONLY, // Store date only
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'ListingRentalDate',
        tableName: 'listing_rental_dates',
        timestamps: false,
    });

    ListingRentalDate.associate = (models) => {
        ListingRentalDate.belongsTo(models.Listing, {
            foreignKey: 'listing_id',
            as: 'listing', // Reverse association
        });
        ListingRentalDate.hasMany(models.ListingRentalDuration, {
            foreignKey: 'date_id',
            as: 'durations', // Association with durations
        });
    };

    return ListingRentalDate;
};
