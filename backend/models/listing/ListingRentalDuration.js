// models/ListingRentalDuration.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ListingRentalDuration extends Model {}

    ListingRentalDuration.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        date_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'listing_rental_dates',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        rental_time_from: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        rental_time_to: {
            type: DataTypes.TIME,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'ListingRentalDuration',
        tableName: 'listing_rental_durations',
        timestamps: false,
    });

    ListingRentalDuration.associate = (models) => {
        ListingRentalDuration.belongsTo(models.ListingRentalDate, {
            foreignKey: 'date_id',
            as: 'date',
        });
    };

    return ListingRentalDuration;
};
