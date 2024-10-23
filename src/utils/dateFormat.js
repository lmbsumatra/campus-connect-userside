export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
  }
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options); // Format date to "Month Day, Year"
};