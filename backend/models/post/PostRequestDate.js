const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class PostRequestDate extends Model {}

    PostRequestDate.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'posts',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        rental_date: {
            type: DataTypes.DATEONLY, 
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'PostRequestDate',
        tableName: 'post_request_dates',
        timestamps: false,
    });

    PostRequestDate.associate = (models) => {
        PostRequestDate.belongsTo(models.Post, {
            foreignKey: 'post_id',
            as: 'post',
        });
        PostRequestDate.hasMany(models.PostRequestDuration, {
            foreignKey: 'date_id',
            as: 'durations', 
        });
    };

    return PostRequestDate;
};
