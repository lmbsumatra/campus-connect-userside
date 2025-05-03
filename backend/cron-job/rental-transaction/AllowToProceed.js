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
const socket = io("http://localhost:3001/", {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Handle socket connection events
socket.on("connect", () => {
  // console.log("Cron job socket connected to server", socket.id);
});

socket.on("connect_error", (error) => {
  // console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  // console.log("Socket disconnected:", reason);
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
            // where: { date: currentDate },
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
          const ALLOWED_TIME_WINDOW = 30 * 60 * 1000;

          let nextStatus = null;
          const THIRTY_MINUTES = 30 * 60 * 1000;

          console.log(`[Rental ${rental.id}]`);
          console.log(`  Date: ${rentalDate}`);
          console.log(`  rental_time_from: ${duration.rental_time_from}`);
          console.log(`  startTime: ${new Date(startTime).toISOString()}`);
          console.log(`  currentTime: ${new Date(currentTime).toISOString()}`);
          console.log(`  diffMins: ${(startTime - currentTime) / (60 * 1000)}`);
          console.log(
            `  canCancel: ${currentTime <= startTime - THIRTY_MINUTES}`
          );

          // Check if cancellation is allowed based on time before rental start
          let canCancel = false;
          if (
            (rental.status === "Requested" || rental.status === "Accepted") &&
            currentTime <= startTime - THIRTY_MINUTES
          ) {
            canCancel = true;
            await rental.update({ is_allowed_to_cancel: true });
          } else if (rental.is_allowed_to_cancel) {
            // Reset cancellation flag if outside window
            await rental.update({ is_allowed_to_cancel: false });
          }

          const ONE_DAY = 24 * 60 * 60 * 1000;
          switch (rental.status) {
            case "Requested":
              if (currentTime >= startTime) {
                nextStatus = "Cancelled"; // Auto-cancel if not accepted
              }
              break;

            case "Accepted":
              if (currentTime >= startTime) {
                await rental.update({ is_allowed_to_proceed: true });
              }
              console.log("currentTime:", currentTime);
              console.log(
                "startTime + ALLOWED_TIME_WINDOW:",
                startTime + ALLOWED_TIME_WINDOW
              );
              console.log("ALLOWED_TIME_WINDOW:", ALLOWED_TIME_WINDOW);

              if (currentTime > startTime + ALLOWED_TIME_WINDOW) {
                console.log("Auto-cancelling rental due to timeout");
                nextStatus = "Cancelled"; // Auto-cancel if not handed over
              }

              break;

            case "HandedOver":
              // Allow the owner to send proof after the rental end time (no need for 30-minute wait)
              if (currentTime >= endTime) {
                await rental.update({ is_allowed_to_proceed: true });
              }

              // After one full day past the rental end time, auto-return the rental
              if (currentTime > endTime + ONE_DAY) {
                nextStatus = "Returned"; // Auto-return if too late
              }
              break;

            case "Returned":
              // Check if current time is beyond the allowed time window plus 24 hours
              if (currentTime > endTime + ONE_DAY) {
                nextStatus = "Completed"; // Auto-complete after 24 hours
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
