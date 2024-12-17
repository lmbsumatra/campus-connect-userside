const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Date extends Model {} 

    Date.init({
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
        status: {
            type: DataTypes.ENUM('available', 'rented'),
            defaultValue: 'available',
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Date',
        tableName: 'dates', 
        timestamps: false, 
    });

    Date.associate = (models) => {
        Date.hasMany(models.Duration, {
            foreignKey: 'date_id',
            as: 'durations', 
        });
    };

    return Date; 
};
