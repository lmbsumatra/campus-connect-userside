import React from "react";

const RentalRateCalculator = ({ pricePerHour, timeFrom, timeTo }) => {
  if (!pricePerHour || !timeFrom || !timeTo) return 0;

  const getHoursDifference = (startTime, endTime) => {
    const parseTime = (time) => {
      const [timePart, modifier] = time.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      } else if (modifier === "AM" && hours === 12) {
        hours = 0; // Midnight case
      }

      return { hours, minutes };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    console.log(start, end);

    const startDate = new Date();
    startDate.setHours(start.hours, start.minutes, 0);

    const endDate = new Date();
    endDate.setHours(end.hours, end.minutes, 0);

    const diffMs = endDate - startDate;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > 0 ? diffHours : 0; // Ensure positive value
  };

  const hours = getHoursDifference(timeFrom, timeTo);
  const totalRate = pricePerHour * hours;

  console.log(hours, totalRate, pricePerHour);

  return {
    total: totalRate.toFixed(2),
    rate: pricePerHour,
    hrs: hours.toFixed(2),
  }; // Return the total rate with two decimal places
};

export default RentalRateCalculator;
