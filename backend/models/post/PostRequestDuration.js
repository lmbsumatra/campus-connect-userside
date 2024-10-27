const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class PostRequestDuration extends Model {}

    PostRequestDuration.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        date_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'post_request_dates',
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
        modelName: 'PostRequestDuration',
        tableName: 'post_request_durations',
        timestamps: false,
    });

    PostRequestDuration.associate = (models) => {
        PostRequestDuration.belongsTo(models.PostRequestDate, {
            foreignKey: 'date_id',
            as: 'date',
        });
    };

    return PostRequestDuration;
};
