const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Post extends Model {}

  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
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
      status_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "approved",
          "declined",
          "removed",
          "revoked",
          "flagged"
        ),
        allowNull: false,
      },
      images: {
        type: DataTypes.TEXT,
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
      post_type: {
        type: DataTypes.ENUM("To Rent", "To Buy"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "posts",
      timestamps: false,
    }
  );

  Post.associate = (models) => {
    Post.hasMany(models.Date, {
      foreignKey: "item_id",
      as: "rental_dates",
    });
    Post.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "renter",
    });
    Post.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "buyer",
    });
  };

  return Post;
};
