const { models } = require("../../models/index"); // Ensure this path is correct
const { Op } = require("sequelize"); // Sequelize operators for comparisons
const moment = require('moment-timezone');

// Function to auto-decline expired rental transactions
async function autoDeclineExpired() {
  try {
    // console.log("Running cron job to auto-decline expired rentals...");
    const manilaTime = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss')
    // Find all rental transactions with status 'Requested' that have expired rental times
    const expiredRentals = await models.RentalTransaction.findAll({
      where: {
        status: 'Requested', // Only consider rentals that are in 'Requested' status
      },
      include: [
        {
          model: models.RentalDate, // Include RentalDate first
          as: 'rental_dates', // Ensure the alias matches your association
          required: true, // Ensures that only rentals with a rental date are fetched
          include: [
            {
              model: models.RentalDuration, // Include RentalDuration after RentalDate
              as: 'durations', // Ensure the alias matches your association
              required: true, // Ensures that only rentals with a rental duration are fetched
              where: {
                rental_time_to: {
                  [Op.lt]: manilaTime, // Expired rental durations (rental_time_to < current date)
                },
              },
            },
          ],
        },
      ],
    });
    // Iterate over the expired rentals and decline them
    for (const rental of expiredRentals) {
      rental.status = "Declined"; // Update status to "Declined"
      await rental.save(); // Save the changes to the database
      // console.log(
      //   `Rental transaction ${rental.id} has been declined due to expiration.`
      // );
    }

    // console.log(
    //   `Checked and updated ${expiredRentals.length} rental transactions.`
    // );
  } catch (error) {
    // console.error("Error in autoDeclineExpired:", error);
  }
}

// Export the function for use elsewhere (e.g., in a cron job)
module.exports = autoDeclineExpired;
