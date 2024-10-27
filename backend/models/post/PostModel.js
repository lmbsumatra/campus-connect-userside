const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Post extends Model {}

    Post.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        renter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        post_item_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        specifications: {
            type: DataTypes.JSON,
        },
        description: {
            type: DataTypes.TEXT,
        },
        tags: {
            type: DataTypes.JSON,
        },
        status: {
            type: DataTypes.ENUM('posted', 'offered', 'flagged', 'pending'),
            allowNull: false,
        },
        images: {
            type: DataTypes.JSON,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
        },
    }, {
        sequelize,
        modelName: 'Post',
        tableName: 'posts',
        timestamps: false,
    });

    Post.associate = (models) => {
        Post.hasMany(models.PostRequestDate, {
            foreignKey: 'post_id',
            as: 'rental_dates',
        });
        Post.belongsTo(models.User, {
            foreignKey: 'renter_id', 
            as: 'renter', 
        });
    };

    return Post;
};
