const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Duration extends Model {}

    Duration.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        date_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'dates',
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
        status: { 
            type: DataTypes.ENUM('available','requested', 'rented'), 
            allowNull: false,
            defaultValue: 'available', 
        },
    }, {
        sequelize,
        modelName: 'Duration',
        tableName: 'durations',
        timestamps: false,
    });

    Duration.associate = (models) => {
        Duration.belongsTo(models.Date, {
            foreignKey: 'date_id',
            as: 'date',
        });
    };

    return Duration;
};
