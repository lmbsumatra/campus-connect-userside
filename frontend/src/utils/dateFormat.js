export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return "Invalid Date";
  }

  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

export const formatDateFromSelectDate = (dateString) => {
  // Ensure the date is valid and create a Date object
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return "Invalid Date"; // Return a consistent invalid date message
  }

  // Extract the year, month, and day from the Date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Return the date in 'YYYY-MM-DD' format, which is consistent for comparison
  return `${year}-${month}-${day}`;
};

export const formatTimeWithAMPM = (dateString) => {
  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return "Invalid Time";
  }

  // Extract the hours and minutes from the date object
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Determine AM or PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Adjust hour to 12-hour format if 0

  // Return formatted time string
  return `${hours}:${minutes} ${ampm}`;
};
