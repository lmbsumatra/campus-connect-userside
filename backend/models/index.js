const { Sequelize } = require('sequelize');
const sequelize = require("../config/database");


const Listing = require('./listing/ListingModel')(sequelize);
const ListingRentalDate = require('./listing/ListingRentalDate')(sequelize);
const ListingRentalDuration = require('./listing/ListingRentalDuration')(sequelize);
const Post = require('./post/PostModel')(sequelize);
const PostRequestDate = require('./post/PostRequestDate')(sequelize);
const PostRequestDuration = require('./post/PostRequestDuration')(sequelize);
const Student = require('./StudentModel')
const User = require('./UserModel')


const models = {
    Listing,
    ListingRentalDate,
    ListingRentalDuration,
    Post,
    PostRequestDate,
    PostRequestDuration,
    Student,
    User
};

Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

module.exports = { sequelize, models };
