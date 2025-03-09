const createStripeOnBoardingLink = require("./createStripeOnBoardingLink");
const getMerchantDetails = require("./getMerchantDetails");

const StudentPaymentController = {
  createStripeOnBoardingLink,
  getMerchantDetails,
};

module.exports = { StudentPaymentController };
