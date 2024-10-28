const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class RentalDate extends Model {} 

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
            type: DataTypes.DATEONLY, 
            allowNull: false,
        },
        item_type: {
            type: DataTypes.ENUM('listing', 'post', 'item_for_sale'),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'RentalDate',
        tableName: 'dates', 
        timestamps: false, 
    });

    RentalDate.associate = (models) => {
        RentalDate.hasMany(models.RentalDuration, {
            foreignKey: 'date_id',
            as: 'durations', 
        });
    };

    return RentalDate; 
};
