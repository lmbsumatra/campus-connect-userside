export const formatTimeTo12Hour = (time) => {
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
};

export const computeDuration = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startDate = new Date(0, 0, 0, startHours, startMinutes);
  const endDate = new Date(0, 0, 0, endHours, endMinutes);

  const diffMs = endDate - startDate;
  const diffMinutes = diffMs / (1000 * 60);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours !== 1 ? `${hours}hrs` : `${hours}hr`}${
    minutes !== 0 ? ` ${minutes}m` : ""
  }`;
};
