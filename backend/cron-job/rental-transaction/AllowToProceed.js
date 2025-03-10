const cron = require("node-cron");
const { models, Sequelize } = require("../../models");
const { initializeSocket } = require("../../socket");
const http = require("http");
const express = require("express");
const { Op } = require("sequelize");
const app = express();
const server = http.createServer(app);

const { io } = require("socket.io-client");

// Create the socket connection outside the cron job
const socket = io("http://localhost:3001", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Handle socket connection events
socket.on("connect", () => {
  console.log("Cron job socket connected to server", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

const AllowToProceed = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running cron job to update rental status...");

    try {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0]; // Get YYYY-MM-DD
      const currentTime = now.getTime(); // Current time in milliseconds

      // Get all active rental transactions
      const rentals = await models.RentalTransaction.findAll({
        where: {
          status: {
            [Op.notIn]: ["Cancelled", "Reviewed"], // Exclude final states
          },
        },
        include: [
          {
            model: models.Date,
            where: { date: currentDate },
            include: [
              {
                model: models.Duration,
                as: "durations",
              },
            ],
          },
        ],
      });

      for (const rental of rentals) {
        if (!rental.Date || !rental.Date.durations) {
          console.error(
            `Missing rental date or duration for rental ID ${rental.id}`
          );
          continue;
        }

        const rentalDate = rental.Date.date;
        const rentalDurations = rental.Date.durations;
        let shouldResetAllow = false;

        for (const duration of rentalDurations) {
          const startTime = new Date(
            `${rentalDate}T${duration.rental_time_from}`
          ).getTime();
          const endTime = new Date(
            `${rentalDate}T${duration.rental_time_to}`
          ).getTime();

          // Now that startTime and endTime exist, calculate ALLOWED_TIME_WINDOW
          const ALLOWED_TIME_WINDOW = Math.max(
            15 * 60 * 1000,
            endTime - startTime
          );

          let nextStatus = null;

          switch (rental.status) {
            case "Requested":
              if (currentTime >= startTime - ALLOWED_TIME_WINDOW) {
                nextStatus = "Cancelled"; // Auto-cancel if not accepted
              }
              break;

            case "Accepted":
              if (currentTime >= startTime - ALLOWED_TIME_WINDOW) {
                await rental.update({ is_allowed_to_proceed: true });
              }
              if (currentTime > startTime + ALLOWED_TIME_WINDOW) {
                nextStatus = "HandedOver"; // Auto-hand over if too late
              }
              break;

            case "HandedOver":
              if (currentTime >= endTime - ALLOWED_TIME_WINDOW) {
                await rental.update({ is_allowed_to_proceed: true });
              }
              if (currentTime > endTime + ALLOWED_TIME_WINDOW) {
                nextStatus = "Returned"; // Auto-return if too late
              }
              break;

            case "Returned":
              if (currentTime > endTime + ALLOWED_TIME_WINDOW) {
                nextStatus = "Completed"; // Auto-complete fast for short rentals
              }
              break;

            // case "Completed":
            //   if (currentTime > endTime + 2 * ALLOWED_TIME_WINDOW) {
            //     nextStatus = "Reviewed"; // Final step
            //   }
            //   break;
          }

          if (nextStatus) {
            await rental.update({
              status: nextStatus,
              is_allowed_to_proceed: false,
              owner_confirmed: false,
              renter_confirmed: false,
            });

            // Emit transaction update
            socket.emit("update-status", {
              rentalId: rental.id,
              renter: rental.renter_id,
              owner: rental.owner_id,
              status: nextStatus,
            });

            console.log(
              `Rental ID ${rental.id} automatically updated to ${nextStatus}.`
            );
          }

          // Reset is_allowed_to_proceed after the allowed time window expires
          if (shouldResetAllow) {
            await rental.update({ is_allowed_to_proceed: false });
            console.log(
              `Rental ID ${rental.id}: is_allowed_to_proceed reset to false.`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error updating rental statuses:", error);
    }
  });
};

module.exports = { AllowToProceed };
